import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

import { QuestControlBar, QuestEarnings, QuestFrame, QuestGoals } from '@components/database/quest';
import { useQuestPage } from '@src/hooks/usePage';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { QuestEditorAndDeletionKeys, QuestEditorOverlay } from '@components/database/quest/editors/QuestEditorOverlay';

export const QuestPage = () => {
  const dialogsRef = useDialogsRef<QuestEditorAndDeletionKeys>();
  const { quest, cannotDelete } = useQuestPage();
  const { t } = useTranslation('database_quests');
  const [goalIndex, setGoalIndex] = useState(0);
  const [earningIndex, setEarningIndex] = useState(0);

  /*const onCloseEditor = () => {
    const currentObjective = currentEditedQuest.objectives[currentObjectiveIndex];
    if (
      currentEditor === 'editGoal' &&
      (currentObjective.objectiveMethodName === 'objective_speak_to' || currentObjective.objectiveMethodName === 'objective_beat_npc') &&
      currentObjective.objectiveMethodArgs[1] === ''
    )
      return;
    if (currentEditor === 'editGoal' || currentEditor === 'editEarning') cleaningQuestNaNValues(currentEditedQuest);
    updateIndexSpeakToBeatNpc(currentEditedQuest);
    setQuest({ [quest.dbSymbol]: currentEditedQuest });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };*/

  /*const editors = {
    new: <QuestNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <QuestFrameEditor quest={currentEditedQuest} openTranslationEditor={openTranslationEditor} />,
    importGoal: <QuestGoalImportEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    editGoal: <QuestGoalEditor quest={currentEditedQuest} objectiveIndex={currentObjectiveIndex} />,
    newGoal: <QuestNewGoalEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    importEarning: <QuestEarningImportEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    editEarning: <QuestEarningEditor quest={currentEditedQuest} earningIndex={currentEarningIndex} />,
    newEarning: <QuestNewEarningEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
  };*/

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
