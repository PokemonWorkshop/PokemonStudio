import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { TrainerControlBar, TrainerDialog, TrainerFrame } from '@components/database/trainer';
import { PokemonBattlerList } from '@components/pokemonBattler';
import { BagEntryList } from '@components/bagEntry';

import { useDialogsRef } from '@utils/useDialogsRef';
import { TrainerEditorAndDeletionKeys, TrainerEditorOverlay } from '@components/database/trainer/editors/TrainerEditorOverlay';
import { useTrainerPage } from '@utils/usePage';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';

export const TrainerPage = () => {
  const dialogsRef = useDialogsRef<TrainerEditorAndDeletionKeys>();
  const { trainer, trainerName, cannotDelete } = useTrainerPage();
  const { t } = useTranslation('database_trainers');

  return (
    <DatabasePageStyle>
      <TrainerControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={0}
              tabs={[
                { label: t('trainer'), path: '/database/trainers' },
                { label: t('resources'), path: '/database/trainers/resources' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <TrainerFrame trainer={trainer} dialogsRef={dialogsRef} />
            <TrainerDialog trainer={trainer} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonBattlerList
              title={t('trainer_party', { name: trainerName })}
              encounters={trainer.party}
              disabledImport={cannotDelete}
              from="trainer"
            />
            <BagEntryList
              title={t('trainer_bag', { name: trainerName })}
              bagEntries={trainer.bagEntries}
              disabledImport={cannotDelete}
              from="trainer"
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete_this_trainer')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <TrainerEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
