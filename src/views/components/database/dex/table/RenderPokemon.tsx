import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';
import { DataPokemonGrid } from './DexPokemonListTableStyle';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { DarkButton, DarkButtonImportResponsive, DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import { DraggableProvided } from '@hello-pangea/dnd';
import { useProjectPokemon, useProjectTypes } from '@hooks/useProjectData';
import { TypeCategory } from '@components/categories';
import { getNameType } from '@utils/getNameType';
import { Input } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { ResourceImage } from '@components/ResourceImage';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioDex } from '@modelEntities/dex';
import { pokemonIconPath } from '@utils/path';
import { StudioCreature } from '@modelEntities/creature';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation } from '@hooks/useShortcutNavigation';
import { DexDialogsRef } from '../editors/DexEditorOverlay';
import { searchUnderAndEvolutions, isCreatureHasNotEvolution, isCreaturesAlreadyInDex } from '@utils/dex';
import { showNotification } from '@utils/showNotification';
import { useUpdateDex } from '../editors/useUpdateDex';

type RenderPokemonContainerProps = {
  isDragging: boolean;
  dragOn: boolean;
};

const RenderPokemonContainer = styled(DataPokemonGrid).attrs<RenderPokemonContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderPokemonContainerProps>`
  box-sizing: border-box;
  padding: 0px 4px 0px 8px;
  box-shadow: ${({ isDragging }) => (isDragging ? `0 0 5px ${theme.colors.dark12}` : 'none')};

  & .drag-icon {
    color: ${theme.colors.text700};
    height: 18px;

    :hover {
      cursor: grab;
    }
  }

  & img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }

  & .buttons:nth-child(6) {
    display: flex;
    gap: 4px;
    justify-content: end;
    align-items: center;
    visibility: hidden;

    ${DarkButton} {
      display: flex;
      flex-direction: row;
      gap: 4px;
      height: 32px;

      @media ${theme.breakpoints.dataBox422} {
        width: 32px;
        padding: 0px;
      }
    }
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  & .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & .error {
    color: ${theme.colors.dangerBase};

    &:hover {
      color: ${theme.colors.dangerBase};
    }
  }

  &:hover {
    .buttons:nth-child(6) {
      visibility: ${({ dragOn }) => (dragOn ? `hidden` : 'visible')};
    }
  }

  &[data-dragged] {
    background-color: ${theme.colors.dark18};
    color: ${theme.colors.text100};
    border-radius: 8px;
  }

  ${EditButtonOnlyIconContainer} {
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }

  ${Input} {
    height: 32px;
    padding: 9.5px 11px;
  }

  @media ${theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 58px 32px 102px auto;

    span:nth-child(5) {
      display: none;
    }
  }
`;

const TypeContainer = styled.span`
  display: flex;
  gap: 8px;
`;

type PokemonDataRender = {
  data: StudioCreature | undefined;
  form: number;
  id: number;
  undef: boolean;
};

type RenderPokemonProps = {
  style: React.CSSProperties;
  pokemon: PokemonDataRender;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
  index: number;
  dex: StudioDex;
  dialogsRef: DexDialogsRef;
  setScrollToRow: (index: number) => void;
  setCreatureIndex: (index: number) => void;
};

export const RenderPokemon = forwardRef<HTMLInputElement, RenderPokemonProps>(
  ({ style, pokemon, provided, isDragging, dragOn, index, dex, dialogsRef, setScrollToRow, setCreatureIndex }, ref) => {
    const { projectDataValues: types } = useProjectTypes();
    const { projectDataValues: allPokemon } = useProjectPokemon();

    const pokemonForm = useMemo(() => pokemon.data?.forms.find((form) => form.form === pokemon.form), [pokemon.data, pokemon.form]);
    const { t } = useTranslation(['database_pokemon', 'database_dex']);
    const getCreatureName = useGetEntityNameText();
    const [state] = useGlobalState();
    const [pokemonId, setPokemonId] = useState<number>(pokemon.id);
    const isClickable: boolean = useKeyPress(CONTROL);
    const shortcutNavigation = usePokemonShortcutNavigation();
    const updateDex = useUpdateDex(dex);

    useEffect(() => {
      setPokemonId(pokemon.id);
    }, [pokemon]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        target.blur();
      }
    };

    const onAddEvolution = (index: number) => {
      const creature = dex.creatures[index];
      const pokemonForm = allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
      if (!pokemonForm) return;

      const creatures = searchUnderAndEvolutions(pokemonForm, creature, allPokemon);
      if (isCreatureHasNotEvolution(creatures, creature)) {
        return showNotification(
          'info',
          t('database_dex:dex'),
          t('database_dex:creature_no_evolution', { name: getCreatureName(allPokemon[creature.dbSymbol]) })
        );
      } else if (isCreaturesAlreadyInDex(dex.creatures, creatures)) {
        return showNotification(
          'info',
          t('database_dex:dex'),
          t('database_dex:creatures_already_in_dex', { name: getCreatureName(allPokemon[creature.dbSymbol]) })
        );
      }

      creatures.forEach((c, i) => dex.creatures.splice(index + i + 1, 0, c));
      if (creatures.length !== 0) dex.creatures.splice(index, 1);
      dex.creatures = dex.creatures.filter((dexc, i, self) => self.findIndex((c) => c.dbSymbol === dexc.dbSymbol) === i);
      updateDex(dex);
    };

    const onEditId = (index: number, id: number) => {
      if (index === id - dex.startId) return;

      const creature = dex.creatures[index];
      dex.creatures.splice(index, 1);
      dex.creatures.splice(id - dex.startId, 0, creature);
      updateDex(dex);
      setScrollToRow(id - dex.startId);
    };

    return (
      <RenderPokemonContainer
        gap="16px"
        ref={ref}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
          ...style,
        }}
        isDragging={isDragging}
        dragOn={dragOn}
      >
        <span className="drag-icon" {...provided.dragHandleProps}>
          <DragIcon />
        </span>
        <Input
          type="number"
          name="pokemon-id"
          min={dex.startId}
          max="9999"
          value={isNaN(pokemonId) ? '' : pokemonId}
          onChange={(event) => {
            const newValue = parseInt(event.target.value);
            if (newValue < dex.startId || newValue > 9999) return event.preventDefault();
            setPokemonId(newValue);
          }}
          onBlur={() => {
            const value = cleanNaNValue(pokemonId, pokemon.id);
            const clampedValue = value > dex.creatures.length - 1 + dex.startId ? dex.creatures.length - 1 + dex.startId : value;
            setPokemonId(clampedValue);
            onEditId(index, clampedValue);
          }}
          onKeyDown={handleKeyDown}
        />
        <span>
          {pokemon.data ? (
            <ResourceImage
              imagePathInProject={pokemonIconPath(pokemon.data, pokemon.form)}
              fallback={pokemon.form === 0 ? undefined : pokemonIconPath(pokemon.data)}
            />
          ) : (
            <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
          )}
        </span>
        {pokemon.data ? (
          <span
            className={`${pokemonForm ? 'name' : 'error'}, ${isClickable ? 'clickable' : undefined}`}
            onClick={() => (isClickable && pokemon?.data?.dbSymbol ? shortcutNavigation(pokemon.data.dbSymbol, pokemon.form) : undefined)}
          >
            {getCreatureName(pokemon.data)}
          </span>
        ) : (
          <span className="error">{pokemon.undef ? t('database_dex:free_slot') : t('database_pokemon:pokemon_deleted')}</span>
        )}
        {pokemonForm ? (
          <TypeContainer>
            <TypeCategory type={pokemonForm.type1}>{getNameType(types, pokemonForm.type1, state)}</TypeCategory>
            {pokemonForm.type2 !== '__undef__' ? (
              <TypeCategory type={pokemonForm.type2}>{getNameType(types, pokemonForm.type2, state)}</TypeCategory>
            ) : (
              <span></span>
            )}
          </TypeContainer>
        ) : (
          <span />
        )}
        <div className="buttons">
          {pokemonForm && (
            <DarkButtonImportResponsive
              onClick={() => onAddEvolution(index)}
              data-tooltip-responsive={t('database_dex:evolutions')}
              breakpoint="screen and (max-width: 1393px)"
            >
              {t('database_dex:evolutions')}
            </DarkButtonImportResponsive>
          )}
          <EditButtonOnlyIcon
            size="s"
            color={theme.colors.primaryBase}
            onClick={() => {
              setCreatureIndex(index);
              dialogsRef?.current?.openDialog('edit');
            }}
          />
          <DeleteButtonOnlyIcon
            size="s"
            onClick={() => {
              dex.creatures.splice(index, 1);
              updateDex(dex);
            }}
          />
        </div>
      </RenderPokemonContainer>
    );
  }
);
RenderPokemon.displayName = 'RenderPokemon';
