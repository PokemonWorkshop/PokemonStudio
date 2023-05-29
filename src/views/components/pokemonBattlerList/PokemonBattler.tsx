import React, { useState } from 'react';
import styled from 'styled-components';
import { PokemonPropertyType } from './PokemonBattlerList';
import { Tag } from '@components/Tag';
import { useProjectAbilities, useProjectItems, useProjectMoves, useProjectPokemon } from '@utils/useProjectData';
import { useGlobalState } from '@src/GlobalStateProvider';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { TypeCategoryPokemonBattler } from '@components/categories';
import { Category } from '@components/categories/Category';
import { DataFieldsetFieldWithChild } from '@components/database/dataBlocks/DataFieldsetField';
import { useTranslation } from 'react-i18next';
import { getNatureText, useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { ResourceImage } from '@components/ResourceImage';
import { itemIconPath, pokemonIconPath } from '@utils/path';
import { StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';

type PokemonBattlerProps = {
  onClickDelete: (index: number) => void;
  onEditPokemonProperty: (index: number, kind: PokemonPropertyType) => void;
  pokemon: StudioGroupEncounter;
  index: number;
  isWild: boolean;
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

  return moveset.filter((move) => move === '__undef__' || move === '__remove__').length === moveset.length ? (
    <></>
  ) : (
    <PokemonBattlerMovesetContainer onClick={onClick} data-has-hover>
      {moveset.map(
        (move, index) =>
          move !== '__undef__' &&
          move !== '__remove__' &&
          (moves[move] ? (
            <TypeCategoryPokemonBattler key={`moveset-${move}-${index}`} type={moves[move].type}>
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

export const PokemonBattler = ({ onClickDelete, onEditPokemonProperty, pokemon, index, isWild }: PokemonBattlerProps) => {
  const [state] = useGlobalState();
  const { projectDataValues: species } = useProjectPokemon();
  const { projectDataValues: abilities } = useProjectAbilities();
  const { projectDataValues: items } = useProjectItems();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const specie = species[pokemon.specie];
  const itemSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'itemHeld' && setup.value !== 'none')?.value as string;
  const item = items[itemSetup];
  const abilitySetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'ability')?.value as string;
  const ability = abilities[abilitySetup];
  const nature = pokemon.expandPokemonSetup.find((setup) => setup.type === 'nature')?.value as string;
  const evSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'evs')?.value as StudioIvEv;
  const movesSetup = pokemon.expandPokemonSetup.find((setup) => setup.type === 'moves')?.value as string[];
  const { t } = useTranslation(['database_abilities', 'database_pokemon', 'database_items', 'pokemon_battler_list']);
  const [allowParentHover, setAllowParentHover] = useState(true);
  const getEntityName = useGetEntityNameText();

  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClickDelete(index);
  };

  const onEdit = (event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>, kind: PokemonPropertyType) => {
    event.stopPropagation();
    onEditPokemonProperty(index, kind);
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
        onClick={() => onEditPokemonProperty(index, 'default')}
        onMouseOver={(event) => handleParentHover(event)}
        className={allowParentHover ? 'can-have-hover' : 'cannot-have-hover'}
      >
        <PokemonBattlerHeader>
          {specie ? (
            <ResourceImage
              imagePathInProject={pokemonIconPath(specie, pokemon.form)}
              fallback={pokemon.form === 0 ? undefined : pokemonIconPath(specie)}
            />
          ) : (
            <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
          )}
          <div className="name-level">
            {specie ? getEntityName(specie) : <span className="error">{t('database_pokemon:pokemon_deleted')}</span>}
            <span className="level">
              {pokemon.levelSetup.kind === 'fixed'
                ? t('pokemon_battler_list:level_value', { level: pokemon.levelSetup.level })
                : pokemon.levelSetup.level.minimumLevel === pokemon.levelSetup.level.maximumLevel
                ? t('pokemon_battler_list:level_value', { level: pokemon.levelSetup.level.minimumLevel })
                : t('pokemon_battler_list:level_to', { min: pokemon.levelSetup.level.minimumLevel, max: pokemon.levelSetup.level.maximumLevel })}
            </span>
          </div>
          <div className="chance-delete-button">
            {isWild && <Tag className="chance">{`${pokemon.randomEncounterChance}%`}</Tag>}
            <ClearButtonOnlyIcon className="delete-button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDelete(event)} />
          </div>
        </PokemonBattlerHeader>
        {itemSetup && (
          <PokemonBattlerItem>
            {item && <ResourceImage imagePathInProject={itemIconPath(item.icon)} />}
            {item ? getEntityName(item) : <span className="error">{t('database_items:item_deleted')}</span>}
          </PokemonBattlerItem>
        )}
        {(abilitySetup || nature) && (
          <PokemonBattlerAbilityNature>
            {abilitySetup && (
              <DataFieldsetFieldWithChild label={t('database_abilities:ability')}>
                {ability ? getAbilityName(ability) : <span className="error">{t('database_abilities:ability_deleted')}</span>}
              </DataFieldsetFieldWithChild>
            )}
            {nature && (
              <DataFieldsetFieldWithChild label={t('pokemon_battler_list:nature')}>{getNatureText(state, nature)}</DataFieldsetFieldWithChild>
            )}
          </PokemonBattlerAbilityNature>
        )}

        {evSetup && <PokemonBattlerEV evs={evSetup} onClick={(event: React.MouseEvent<HTMLSpanElement>) => onEdit(event, 'evs')} />}
        {movesSetup && <PokemonBattlerMoveset moveset={movesSetup} onClick={(event: React.MouseEvent<HTMLSpanElement>) => onEdit(event, 'moves')} />}
      </PokemonBattlerContainer>
    </PokemonBattlerMainContainer>
  );
};
