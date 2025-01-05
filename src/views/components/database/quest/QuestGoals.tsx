import { DataBlockEditor } from '@components/editor';
import { StudioQuest } from '@modelEntities/quest';
import { useProjectQuests } from '@hooks/useProjectData';
import { useTranslation } from 'react-i18next';
import { QuestGoalsTable } from './tables';
import { QuestDialogsRef } from './editors/QuestEditorOverlay';
import React from 'react';

type QuestGoalsProps = {
  quest: StudioQuest;
  dialogsRef: QuestDialogsRef;
  setGoalIndex: (index: number) => void;
};

export const QuestGoals = ({ quest, dialogsRef, setGoalIndex }: QuestGoalsProps) => {
  const { projectDataValues: quests } = useProjectQuests();
  const { t } = useTranslation('database_quests');

  const editGoal = (index: number) => {
    dialogsRef.current?.openDialog('goal');
    setGoalIndex(index);
  };

  return (
    <DataBlockEditor
      size="full"
      title={t('goals')}
      onClickDelete={() => dialogsRef.current?.openDialog('goal_deletion', true)}
      importation={{ label: t('import_goals'), onClick: () => dialogsRef.current?.openDialog('goal_import') }}
      add={{ label: t('add_goal'), onClick: () => dialogsRef.current?.openDialog('goal_new') }}
      disabledDeletion={quest.objectives.length === 0}
      disabledImport={Object.keys(quests).length <= 1}
    >
      <QuestGoalsTable quest={quest} editGoal={editGoal} />
    </DataBlockEditor>
  );
};
