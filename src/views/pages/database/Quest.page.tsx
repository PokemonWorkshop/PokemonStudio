import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';

import { useProjectQuests } from '@utils/useProjectData';
import { QuestControlBar, QuestDeletion, QuestEarnings, QuestFrame, QuestGoals } from '@components/database/quest';
import {
  QuestEarningEditor,
  QuestEarningImportEditor,
  QuestFrameEditor,
  QuestGoalEditor,
  QuestGoalImportEditor,
  QuestNewEarningEditor,
  QuestNewEditor,
  QuestNewGoalEditor,
} from '@components/database/quest/editors';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';

export const QuestPage = () => {
  const {
    projectDataValues: quests,
    selectedDataIdentifier: questDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setQuest,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ quest: selected.value });
  const quest = quests[questDbSymbol];
  const currentEditedQuest = useMemo(() => quest.clone(), [quest]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentObjectiveIndex, setObjectiveIndex] = useState(0);
  const [currentEarningIndex, setEarningIndex] = useState(0);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ quest: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ quest: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [getPreviousDbSymbol, getNextDbSymbol, currentEditor, currentDeletion]);
  useShortcut(shortcutMap);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 45 },
      translation_description: { fileId: 46, isMultiline: true },
    },
    currentEditedQuest.id,
    currentEditedQuest.name()
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && quest.name() === '') return;
    const currentObjective = currentEditedQuest.objectives[currentObjectiveIndex];
    if (
      currentEditor === 'editGoal' &&
      (currentObjective.objectiveMethodName === 'objective_speak_to' || currentObjective.objectiveMethodName === 'objective_beat_npc') &&
      currentObjective.objectiveMethodArgs[1] === ''
    )
      return;
    if (currentEditor === 'editGoal' || currentEditor === 'editEarning') currentEditedQuest.cleaningNaNValues();
    currentEditedQuest.updateIndexSpeakToBeatNpc();
    setQuest({ [quest.dbSymbol]: currentEditedQuest });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onCloseDeletion = () => {
    setCurrentDeletion(undefined);
  };

  const onEditGoal = (index: number) => {
    setObjectiveIndex(index);
    setCurrentEditor('editGoal');
  };

  const onEditEarning = (index: number) => {
    setEarningIndex(index);
    setCurrentEditor('editEarning');
  };

  const editors = {
    new: <QuestNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <QuestFrameEditor quest={currentEditedQuest} openTranslationEditor={openTranslationEditor} />,
    importGoal: <QuestGoalImportEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    editGoal: <QuestGoalEditor quest={currentEditedQuest} objectiveIndex={currentObjectiveIndex} />,
    newGoal: <QuestNewGoalEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    importEarning: <QuestEarningImportEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
    editEarning: <QuestEarningEditor quest={currentEditedQuest} earningIndex={currentEarningIndex} />,
    newEarning: <QuestNewEarningEditor quest={currentEditedQuest} onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    quest: <QuestDeletion type="quest" onClose={onCloseDeletion} />,
    goals: <QuestDeletion type="goals" onClose={onCloseDeletion} />,
    earnings: <QuestDeletion type="earnings" onClose={onCloseDeletion} />,
  };

  return (
    <DatabasePageStyle>
      <QuestControlBar onChange={onChange} quest={quest} onClickNewQuest={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <QuestFrame quest={quest} onClick={() => setCurrentEditor('frame')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <QuestGoals
              quest={quest}
              onDelete={() => setCurrentDeletion('goals')}
              onImport={() => setCurrentEditor('importGoal')}
              onNew={() => setCurrentEditor('newGoal')}
              onEdit={onEditGoal}
            />
            <QuestEarnings
              quest={quest}
              onDelete={() => setCurrentDeletion('earnings')}
              onImport={() => setCurrentEditor('importEarning')}
              onNew={() => setCurrentEditor('newEarning')}
              onEdit={onEditEarning}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('quest')} disabled={Object.entries(quests).length === 1}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
