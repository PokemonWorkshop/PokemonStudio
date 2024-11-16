import React, { useState } from 'react';
import styled from 'styled-components';
import { Tag } from '@components/Tag';
import { useProjectAbilities, useProjectItems, useProjectMoves, useProjectNatures, useProjectPokemon } from '@hooks/useProjectData';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { TypeCategoryPokemonBattler } from '@components/categories';
import { Category } from '@components/categories/Category';
import { DataFieldsetFieldWithChild } from '@components/database/dataBlocks/DataFieldsetField';
import { useTranslation } from 'react-i18next';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { ResourceImage } from '@components/ResourceImage';
import { itemIconPath, pokemonIconPath } from '@utils/path';
import { StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation, useShortcutNavigation } from '@hooks/useShortcutNavigation';
import type { CurrentBattlerType, PokemonBattlerDialogsRef, PokemonBattlerFrom, PokemonPropertyType } from './editors/PokemonBattlerEditorOverlay';
import { assertUnreachable } from '@utils/assertUnreachable';

type PokemonBattlerProps = {
  pokemon: StudioGroupEncounter;
  index: number;
  from: PokemonBattlerFrom;
  dialogsRef: PokemonBattlerDialogsRef;
  setCurrentBattler: React.Dispatch<React.SetStateAction<CurrentBattlerType>>;
};

const PokemonBattlerMainContainer = styled.div`
  width: 100%;

  & .can-have-hover:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    border: 2px solid ${({ theme }) => theme.colors.dark20};
    padding: 15px;

    .chance {
      display: none;
    }

    .delete-button {
      display: flex;
      width: 40px;
    }
  }
`;

export const PokemonBattlerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  height: 100%;
  ${({ theme }) => theme.fonts.normalMedium}
  cursor: pointer;

  & ${Tag} {
    background-color: ${({ theme }) => theme.colors.dark20};
  }

  & span.error {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

const PokemonBattlerHeader = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 62px;
  gap: 12px;
  align-items: center;
  height: 40px;

  & img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }

  & div.name-level {
    display: flex;
    flex-direction: column;
    gap: 0px;

    & span.level {
      color: ${({ theme }) => theme.colors.text400};
    }
  }

  & div.chance-delete-button {
    display: flex;
    justify-content: right;
    align-items: center;

    .chance {
      height: 27px;
      box-sizing: border-box;
    }
  }

  & .delete-button {
    display: none;
  }
`;

const PokemonBattlerItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  cursor: pointer;

  & img {
    max-width: 32px;
    max-height: 32px;
  }
`;

const PokemonBattlerAbilityNature = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
`;

const PokemonBattlerEVContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: -8px;
  padding: 8px;
  border-radius: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

type PokemonBattlerEVProps = {
  evs: StudioIvEv;
  onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
};

const PokemonBattlerEV = ({ evs, onClick }: PokemonBattlerEVProps) => {
  return evs.hp + evs.atk + evs.dfe + evs.ats + evs.dfs + evs.spd === 0 ? (
    <></>
  ) : (
    <PokemonBattlerEVContainer onClick={onClick} data-has-hover>
      {evs.hp !== 0 && <Tag data-has-hover>{`${evs.hp} HP`}</Tag>}
      {evs.atk !== 0 && <Tag data-has-hover>{`${evs.atk} Atk`}</Tag>}
      {evs.dfe !== 0 && <Tag data-has-hover>{`${evs.dfe} Dfe`}</Tag>}
      {evs.ats !== 0 && <Tag data-has-hover>{`${evs.ats} SpA`}</Tag>}
      {evs.dfs !== 0 && <Tag data-has-hover>{`${evs.dfs} SpD`}</Tag>}
      {evs.spd !== 0 && <Tag data-has-hover>{`${evs.spd} Spe`}</Tag>}
    </PokemonBattlerEVContainer>
  );
};

const PokemonBattlerMovesetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: -8px;
  padding: 8px;
  border-radius: 4px;

  ${Category} {
    width: inherit;
    text-align: left;
    padding: 4px 8px;
  }

  & span.error {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.dangerBase};
    padding: 4px 8px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

type PokemonBattlerMovesetProps = {
  moveset: string[];
  onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
};

const PokemonBattlerMoveset = ({ moveset, onClick }: PokemonBattlerMovesetProps) => {
  const { projectDataValues: moves } = useProjectMoves();
  const { t } = useTranslation('database_moves');
  const getMoveName = useGetEntityNameText();
  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutNavigation = useShortcutNavigation('moves', 'move', '/database/moves/');

  return moveset.filter((move) => move === '__undef__' || move === '__remove__').length === moveset.length ? (
    <></>
  ) : (
    <PokemonBattlerMovesetContainer onClick={isClickable ? undefined : onClick} data-has-hover>
      {moveset.map(
        (move, index) =>
          move !== '__undef__' &&
          move !== '__remove__' &&
          (moves[move] ? (
            <TypeCategoryPokemonBattler
              key={`moveset-${move}-${index}`}
              type={moves[move].type}
              isClickable={isClickable}
              shortcutNavigation={() => shortcutNavigation(moves[move].dbSymbol)}
            >
              {getMoveName(moves[move])}
            </TypeCategoryPokemonBattler>
          ) : (
            <span key={`moveset-${move}-${index}`} className="error" data-has-hover>
              {t('move_deleted')}
            </span>
          ))
      )}
    </PokemonBattlerMovesetContainer>
  );
};

const RenderSpanClickable = ({ isClickable, label, shortcut }: { isClickable: boolean; label: string; shortcut: () => void }) => {
  return (
    <span onClick={isClickable ? () => shortcut() : undefined} className={isClickable ? 'clickable' : undefined}>
      {label}
    </span>
  );
};

const showChance = (from: PokemonBattlerFrom) => {
  switch (from) {
    case 'group':
      return true;
    case 'trainer':
      return false;
    default:
      assertUnreachable(from);
  }
  return false;
};

export const PokemonBattler = ({ pokemon, index, from, dialogsRef, setCurrentBattler }: PokemonBattlerProps) => {
  const { projectDataValues: species } = useProjectPokemon();
  const { projectDataValues: abilities } = useProjectAbilities();
  const { projectDataValues: items } = useProjectItems();
  const { projectDataValues: natures } = useProjectNatures();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const specie = species[pokemon.specie];
  const itemSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'itemHeld' && setup.value !== 'none')?.value as string;
  const item = items[itemSetup];
  const abilitySetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'ability')?.value as string;
  const ability = abilities[abilitySetup];
  const natureSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'nature')?.value as string;
  const nature = natures[natureSetup];
  const evSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'evs')?.value as StudioIvEv;
  const movesSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'moves')?.value as string[];
  const { t } = useTranslation(['database_abilities', 'database_pokemon', 'database_items', 'pokemon_battler_list']);
  const [allowParentHover, setAllowParentHover] = useState(true);
  const getEntityName = useGetEntityNameText();

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();
  const shortcutAbilityNavigation = useShortcutNavigation('abilities', 'ability', '/database/abilities/');
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');

  const iconSelector = (pokemon: StudioGroupEncounter) => {
    const isFemale = pokemon.expandPokemonSetup.find((setup) => setup.type === 'gender')?.value === 2;
    if (pokemon.shinySetup.kind === 'rate' && pokemon.shinySetup.rate === 1) {
      return isFemale ? 'iconShinyF' : 'iconShiny';
    }
    return isFemale ? 'iconF' : 'icon';
  };

  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentBattler({ index, kind: undefined });
    dialogsRef.current?.openDialog('deletion', true);
  };

  const onEdit = (event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>, kind: PokemonPropertyType) => {
    event.stopPropagation();
    setCurrentBattler({ index, kind });
    dialogsRef.current?.openDialog('edit');
  };

  const handleParentHover = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('data-has-hover')) {
      if (allowParentHover) setAllowParentHover(false);
    } else {
      if (!allowParentHover) setAllowParentHover(true);
    }
  };

  return (
    <PokemonBattlerMainContainer>
      <PokemonBattlerContainer
        onClick={(event) => (isClickable ? null : onEdit(event, 'default'))}
        onMouseOver={(event) => handleParentHover(event)}
        className={allowParentHover ? 'can-have-hover' : 'cannot-have-hover'}
      >
        <PokemonBattlerHeader>
          {specie ? (
            <ResourceImage
              imagePathInProject={pokemonIconPath(specie, pokemon.form, iconSelector(pokemon))}
              fallback={pokemon.form === 0 ? undefined : pokemonIconPath(specie)}
            />
          ) : (
            <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
          )}
          <div className="name-level">
            {specie ? (
              <RenderSpanClickable
                label={getEntityName(specie)}
                isClickable={isClickable}
                shortcut={() => shortcutPokemonNavigation(specie.dbSymbol, pokemon.form)}
              />
            ) : (
              <span className="error">{t('database_pokemon:pokemon_deleted')}</span>
            )}
            <span className="level">
              {pokemon.levelSetup.kind === 'fixed'
                ? t('pokemon_battler_list:level_value', { level: pokemon.levelSetup.level })
                : pokemon.levelSetup.level.minimumLevel === pokemon.levelSetup.level.maximumLevel
                ? t('pokemon_battler_list:level_value', { level: pokemon.levelSetup.level.minimumLevel })
                : t('pokemon_battler_list:level_to', { min: pokemon.levelSetup.level.minimumLevel, max: pokemon.levelSetup.level.maximumLevel })}
            </span>
          </div>
          <div className="chance-delete-button">
            {showChance(from) && <Tag className="chance">{`${pokemon.randomEncounterChance}%`}</Tag>}
            <ClearButtonOnlyIcon className="delete-button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDelete(event)} />
          </div>
        </PokemonBattlerHeader>
        {itemSetup && (
          <PokemonBattlerItem>
            {item && <ResourceImage imagePathInProject={itemIconPath(item.icon)} />}
            {item ? (
              <RenderSpanClickable label={getEntityName(item)} isClickable={isClickable} shortcut={() => shortcutItemNavigation(item.dbSymbol)} />
            ) : (
              <span className="error">{t('database_items:item_deleted')}</span>
            )}
          </PokemonBattlerItem>
        )}
        {(abilitySetup || nature) && (
          <PokemonBattlerAbilityNature>
            {abilitySetup && (
              <DataFieldsetFieldWithChild label={t('database_abilities:ability')}>
                {ability ? (
                  <RenderSpanClickable
                    label={getAbilityName(ability)}
                    isClickable={isClickable}
                    shortcut={() => shortcutAbilityNavigation(ability.dbSymbol)}
                  />
                ) : (
                  <span className="error">{t('database_abilities:ability_deleted')}</span>
                )}
              </DataFieldsetFieldWithChild>
            )}
            {nature && <DataFieldsetFieldWithChild label={t('pokemon_battler_list:nature')}>{getEntityName(nature)}</DataFieldsetFieldWithChild>}
          </PokemonBattlerAbilityNature>
        )}

        {evSetup && <PokemonBattlerEV evs={evSetup} onClick={(event: React.MouseEvent<HTMLSpanElement>) => onEdit(event, 'evs')} />}
        {movesSetup && <PokemonBattlerMoveset moveset={movesSetup} onClick={(event: React.MouseEvent<HTMLSpanElement>) => onEdit(event, 'moves')} />}
      </PokemonBattlerContainer>
    </PokemonBattlerMainContainer>
  );
};
