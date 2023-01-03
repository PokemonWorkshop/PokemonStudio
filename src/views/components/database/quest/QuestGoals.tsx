import { DataBlockEditor } from '@components/editor';
import { StudioQuest } from '@modelEntities/quest';
import { useProjectQuests } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalsTable } from './tables';

type QuestGoalsProps = {
  quest: StudioQuest;
  onDelete: () => void;
  onImport: () => void;
  onNew: () => void;
  onEdit: (index: number) => void;
};

export const QuestGoals = ({ quest, onDelete, onImport, onNew, onEdit }: QuestGoalsProps) => {
  const { projectDataValues: quests } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  return (
    <DataBlockEditor
      size="full"
      title={t('goals')}
      onClickDelete={onDelete}
      importation={{ label: t('import_goals'), onClick: onImport }}
      add={{ label: t('add_goal'), onClick: onNew }}
      disabledDeletion={quest.objectives.length === 0}
      disabledImport={Object.entries(quests).length <= 1}
    >
      <QuestGoalsTable quest={quest} onEdit={onEdit} />
    </DataBlockEditor>
  );
};
