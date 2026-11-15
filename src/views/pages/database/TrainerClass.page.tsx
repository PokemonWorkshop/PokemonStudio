import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { TrainerClassFrame } from '@components/database/trainerClass/TrainerClassFrame';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

import { TrainerClassEditorAndDeletionKeys, TrainerClassEditorOverlay } from '@components/database/trainerClass/editors/TrainerClassEditorOverlay';
import { TrainerClassControlBar } from '@components/database/trainerClass/TrainerClassControlBar';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useTrainerClassPage } from '@hooks/usePage';

export const TrainerClassPage = () => {
  const dialogsRef = useDialogsRef<TrainerClassEditorAndDeletionKeys>();
  const { trainerClass, cannotDelete } = useTrainerClassPage();
  const { t } = useTranslation();

  return (
    <DatabasePageStyle>
      <TrainerClassControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <TrainerClassFrame trainerClass={trainerClass} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete_this_trainer_class')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <TrainerClassEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
