import { DarkButtonImportResponsive, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PokemonBattler } from './PokemonBattler';

import { Tag } from '@components/Tag';
import { DarkButtonReOrderResponsive } from '@components/buttons/DarkButtonWithPlusIcon';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useTrainerPage } from '@hooks/usePage';
import { useConfigSettings } from '@hooks/useProjectConfig';
import { assertUnreachable } from '@utils/assertUnreachable';
import { PokemonBattlerEditorOverlay } from './editors';
import type { CurrentBattlerType, PokemonBattlerEditorAndDeletionKeys, PokemonBattlerFrom } from './editors/PokemonBattlerEditorOverlay';

type PokemonBattlerListProps = {
  title: string;
  encounters: StudioGroupEncounter[];
  disabledImport: boolean;
  from: Exclude<PokemonBattlerFrom, 'quest_earning'>;
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

  .header,
  .buttons {
    display: flex;
    gap: 12px;
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
  const { t } = useTranslation();
  const { trainer } = useTrainerPage();
  const { projectConfigValues: settings } = useConfigSettings();
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({ index: 0, kind: undefined });

  const importText = () => {
    switch (from) {
      case 'group':
        return t('import_creature_list');
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
          {totalEncounterChance > 0 && from === 'group' && <Tag className="chance">{`${totalEncounterChance}%`}</Tag>}
        </div>
        <div className="buttons">
          {from === 'trainer' && (
            <DarkButtonReOrderResponsive
              onClick={() => dialogsRef.current?.openDialog('change_order')}
              data-tooltip-responsive={t('change_order')}
              disabled={trainer.party.length <= 1}
            >
              {t('change_order')}
            </DarkButtonReOrderResponsive>
          )}
          <DarkButtonImportResponsive
            onClick={() => dialogsRef.current?.openDialog('import')}
            data-tooltip-responsive={importText()}
            disabled={disabledImport}
          >
            {importText()}
          </DarkButtonImportResponsive>
          <SecondaryButtonWithPlusIconResponsive
            onClick={() => dialogsRef.current?.openDialog('new')}
            data-tooltip-responsive={t('add_creature')}
            disabled={from === 'trainer' && trainer.party.length >= settings.trainerPartyMaxSize}
          >
            {t('add_creature')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </PokemonBattlerListHeader>
      {encounters.length === 0 ? (
        <span className="no-data">{t('no_creature')}</span>
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
