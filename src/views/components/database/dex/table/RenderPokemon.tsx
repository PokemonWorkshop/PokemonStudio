import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { useTranslation } from 'react-i18next';
import { DataPokemonGrid } from './DexPokemonListTableStyle';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { DarkButton, DarkButtonImportResponsive, DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useProjectTypes } from '@utils/useProjectData';
import { useGlobalState } from '@src/GlobalStateProvider';
import { TypeCategory } from '@components/categories';
import { getNameType } from '@utils/getNameType';
import { Input } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import DexModel from '@modelEntities/dex/Dex.model';

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
    max-width: 32px;
    max-height: 32px;
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

  & .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & .error {
    color: ${theme.colors.dangerBase};

    & :hover {
      color: ${theme.colors.dangerBase};
    }
  }

  & :hover {
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

    &:hover {
      padding: 8.5px 10px;
    }

    &:focus {
      padding: 8.5px 10px;
    }
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
  data: PokemonModel | undefined;
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
  dex: DexModel;
  onClickEdit: () => void;
  onClickDelete: () => void;
  onClickAddEvolution: () => void;
  onEditId: (index: number, id: number) => void;
};

export const RenderPokemon = React.forwardRef<HTMLInputElement, RenderPokemonProps>(
  ({ style, pokemon, provided, isDragging, dragOn, index, dex, onClickEdit, onClickDelete, onClickAddEvolution, onEditId }, ref) => {
    const [state] = useGlobalState();
    const { projectDataValues: types } = useProjectTypes();
    const pokemonForm = useMemo(() => pokemon.data?.forms.find((form) => form.form === pokemon.form), [pokemon.data, pokemon.form]);
    const { t } = useTranslation(['database_pokemon', 'database_dex']);
    const [pokemonId, setPokemonId] = useState<number>(pokemon.id);

    useEffect(() => {
      setPokemonId(pokemon.id);
    }, [pokemon]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        target.blur();
      }
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
            <img
              draggable="false"
              src={
                state.projectPath
                  ? pokemon.data.icon(
                      state,
                      pokemon.data.forms.find((form) => form.form === pokemon.form)
                    )
                  : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'
              }
              alt=""
            />
          ) : (
            <img
              draggable="false"
              src={
                state.projectPath
                  ? `${state.projectPath}/graphics/pokedex/pokeicon/000.png`
                  : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'
              }
            />
          )}
        </span>
        {pokemon.data ? (
          <span className={pokemonForm ? 'name' : 'error'}>{pokemon.data.name()}</span>
        ) : (
          <span className="error">{pokemon.undef ? t('database_dex:free_slot') : t('database_pokemon:pokemon_deleted')}</span>
        )}
        {pokemonForm ? (
          <TypeContainer>
            <TypeCategory type={pokemonForm.type1}>{getNameType(types, pokemonForm.type1)}</TypeCategory>
            {pokemonForm.type2 !== '__undef__' ? (
              <TypeCategory type={pokemonForm.type2}>{getNameType(types, pokemonForm.type2)}</TypeCategory>
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
              onClick={onClickAddEvolution}
              tooltip={{ right: '110%', top: '-4%' }}
              breakpoint="screen and (max-width: 1393px)"
            >
              {t('database_dex:evolutions')}
            </DarkButtonImportResponsive>
          )}
          <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
          <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
        </div>
      </RenderPokemonContainer>
    );
  }
);
RenderPokemon.displayName = 'RenderPokemon';
