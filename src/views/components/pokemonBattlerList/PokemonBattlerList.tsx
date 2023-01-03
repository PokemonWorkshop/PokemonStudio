import React from 'react';
import styled from 'styled-components';
import { DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { DarkButton, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { PokemonBattler } from './PokemonBattler';
import { useTranslation } from 'react-i18next';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

type PokemonBattlerListProps = {
  title: string;
  onClickAdd: () => void;
  onClickImport: () => void;
  onClickDelete: (index: number) => void;
  onEditPokemonProperty: (index: number, kind: PokemonPropertyType) => void;
  pokemonBattlers: StudioGroupEncounter[];
  disabledImport: boolean;
  isWild?: true;
};

export type PokemonPropertyType = 'default' | 'evs' | 'moves';

export type CurrentBattlerType = {
  index: undefined | number;
  kind: undefined | PokemonPropertyType;
};

export const PokemonBattlerListComponent = styled(DataBlockEditorContainer)`
  display: flex;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;
  gap: 16px;

  & span.no-data {
    ${({ theme }) => theme.fonts.normalRegular};
    color: ${({ theme }) => theme.colors.text500};
  }
`;

export const PokemonBattlerListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark18};

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6}
  }

  .buttons {
    display: flex;
    gap: 12px;

    .button-import-full {
      display: block;
    }

    .button-import-reduce {
      display: none;
    }
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    .buttons {
      .button-import-full {
        display: none;
      }

      .button-import-reduce {
        display: block;
      }
    }
  }
`;

export const PokemonBattlerListGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 17px;
  row-gap: 16px;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const PokemonBattlerList = ({
  title,
  onClickAdd,
  onClickImport,
  onClickDelete,
  onEditPokemonProperty,
  pokemonBattlers,
  disabledImport,
  isWild,
}: PokemonBattlerListProps) => {
  const { t } = useTranslation('pokemon_battler_list');
  return (
    <PokemonBattlerListComponent size="full" data-noactive>
      <PokemonBattlerListHeader>
        <div className="title">{title}</div>
        <div className="buttons">
          <div className="button-import-full">
            <DarkButton onClick={onClickImport} disabled={disabledImport}>
              {isWild ? t('import_pokemon_list') : t('import_team')}
            </DarkButton>
          </div>
          <div className="button-import-reduce">
            <DarkButton onClick={onClickImport} disabled={disabledImport}>
              {t('import')}
            </DarkButton>
          </div>
          <SecondaryButtonWithPlusIconResponsive onClick={onClickAdd} tooltip={{ right: '100%', top: '100%' }}>
            {t('add_pokemon')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </PokemonBattlerListHeader>
      {pokemonBattlers.length === 0 ? (
        <span className="no-data">{t('no_pokemon')}</span>
      ) : (
        <PokemonBattlerListGrid>
          {pokemonBattlers.map((pokemonBattler, index) => (
            <PokemonBattler
              key={`pokemon-battler-${index}`}
              onClickDelete={onClickDelete}
              onEditPokemonProperty={onEditPokemonProperty}
              pokemon={pokemonBattler}
              index={index}
              isWild={isWild || false}
            />
          ))}
        </PokemonBattlerListGrid>
      )}
    </PokemonBattlerListComponent>
  );
};
