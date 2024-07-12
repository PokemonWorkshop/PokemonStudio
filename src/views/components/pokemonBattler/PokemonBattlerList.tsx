import React, { useState } from 'react';
import styled from 'styled-components';
import { DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { DarkButton, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { PokemonBattler } from './PokemonBattler';
import { useTranslation } from 'react-i18next';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

import { useDialogsRef } from '@hooks/useDialogsRef';
import { PokemonBattlerEditorOverlay } from './editors';
import type { CurrentBattlerType, PokemonBattlerEditorAndDeletionKeys, PokemonBattlerFrom } from './editors/PokemonBattlerEditorOverlay';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useTrainerPage } from '@hooks/usePage';
import { Tag } from '@components/Tag';

type PokemonBattlerListProps = {
  title: string;
  encounters: StudioGroupEncounter[];
  disabledImport: boolean;
  from: PokemonBattlerFrom;
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

  .header {
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
    .header {
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

export const PokemonBattlerList = ({ title, encounters, disabledImport, from }: PokemonBattlerListProps) => {
  const dialogsRef = useDialogsRef<PokemonBattlerEditorAndDeletionKeys>();
  const { t } = useTranslation('pokemon_battler_list');
  const { trainer } = useTrainerPage();
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({ index: 0, kind: undefined });

  const importText = () => {
    switch (from) {
      case 'group':
        return t('import_pokemon_list');
      case 'trainer':
        return t('import_team');
      default:
        assertUnreachable(from);
    }
    return '';
  };

  const totalEncounterChance = encounters.map((encounter) => encounter.randomEncounterChance).reduce((a, b) => a + b, 0);

  return (
    <PokemonBattlerListComponent size="full" data-noactive>
      <PokemonBattlerListHeader>
        <div className="header">
          <div className="title">{title}</div>
          {totalEncounterChance > 0 && <Tag className="chance">{`${totalEncounterChance}%`}</Tag>}
        </div>
        <div className="header">
          <div className="button-import-full">
            <DarkButton onClick={() => dialogsRef.current?.openDialog('import')} disabled={disabledImport}>
              {importText()}
            </DarkButton>
          </div>
          <div className="button-import-reduce">
            <DarkButton onClick={() => dialogsRef.current?.openDialog('import')} disabled={disabledImport}>
              {t('import')}
            </DarkButton>
          </div>
          <SecondaryButtonWithPlusIconResponsive
            onClick={() => dialogsRef.current?.openDialog('new')}
            data-tooltip-responsive={t('add_pokemon')}
            disabled={from === 'trainer' && trainer.party.length >= 6}
          >
            {t('add_pokemon')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </PokemonBattlerListHeader>
      {encounters.length === 0 ? (
        <span className="no-data">{t('no_pokemon')}</span>
      ) : (
        <PokemonBattlerListGrid>
          {encounters.map((encounter, index) => (
            <PokemonBattler
              key={`pokemon-battler-${index}`}
              pokemon={encounter}
              index={index}
              from={from}
              dialogsRef={dialogsRef}
              setCurrentBattler={setCurrentBattler}
            />
          ))}
        </PokemonBattlerListGrid>
      )}
      <PokemonBattlerEditorOverlay ref={dialogsRef} currentBattler={currentBattler} from={from} />
    </PokemonBattlerListComponent>
  );
};
