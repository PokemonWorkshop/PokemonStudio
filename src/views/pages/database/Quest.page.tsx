import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { QuestControlBar, QuestEarnings, QuestFrame, QuestGoals } from '@components/database/quest';
import { useQuestPage } from '@src/hooks/usePage';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { QuestEditorAndDeletionKeys, QuestEditorOverlay } from '@components/database/quest/editors/QuestEditorOverlay';
import React, { useState } from 'react';

export const QuestPage = () => {
  const dialogsRef = useDialogsRef<QuestEditorAndDeletionKeys>();
  const { quest, cannotDelete } = useQuestPage();
  const { t } = useTranslation('database_quests');
  const [goalIndex, setGoalIndex] = useState(0);
  const [earningIndex, setEarningIndex] = useState(0);

  return (
    <DatabasePageStyle>
      <QuestControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <QuestFrame quest={quest} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <QuestGoals quest={quest} dialogsRef={dialogsRef} setGoalIndex={setGoalIndex} />
            <QuestEarnings quest={quest} dialogsRef={dialogsRef} setEarningIndex={setEarningIndex} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <QuestEditorOverlay ref={dialogsRef} goalIndex={goalIndex} earningIndex={earningIndex} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
