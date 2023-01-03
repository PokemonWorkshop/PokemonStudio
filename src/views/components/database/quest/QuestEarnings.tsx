import { DataBlockEditor } from '@components/editor';
import { StudioQuest } from '@modelEntities/quest';
import { useProjectQuests } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestEarningsTable } from './tables';

type QuestEarningsProps = {
  quest: StudioQuest;
  onDelete: () => void;
  onImport: () => void;
  onNew: () => void;
  onEdit: (index: number) => void;
};

export const QuestEarnings = ({ quest, onDelete, onImport, onNew, onEdit }: QuestEarningsProps) => {
  const { projectDataValues: quests } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  return (
    <DataBlockEditor
      size="full"
      title={t('earnings')}
      onClickDelete={onDelete}
      importation={{ label: t('import_earnings'), onClick: onImport }}
      add={{ label: t('add_earning'), onClick: onNew }}
      disabledDeletion={quest.earnings.length === 0}
      disabledImport={Object.entries(quests).length <= 1}
    >
      <QuestEarningsTable quest={quest} onEdit={onEdit} />
    </DataBlockEditor>
  );
};
