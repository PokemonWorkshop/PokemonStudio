import { DataBlockEditor } from '@components/editor';
import { StudioQuest } from '@modelEntities/quest';
import { useProjectQuests } from '@hooks/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestEarningsTable } from './tables';
import { QuestDialogsRef } from './editors/QuestEditorOverlay';

type QuestEarningsProps = {
  quest: StudioQuest;
  dialogsRef: QuestDialogsRef;
  setEarningIndex: (index: number) => void;
};

export const QuestEarnings = ({ quest, dialogsRef, setEarningIndex }: QuestEarningsProps) => {
  const { projectDataValues: quests } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  return (
    <DataBlockEditor
      size="full"
      title={t('earnings')}
      onClickDelete={() => dialogsRef.current?.openDialog('earning_deletion', true)}
      importation={{ label: t('import_earnings'), onClick: () => dialogsRef.current?.openDialog('earning_import') }}
      add={{ label: t('add_earning'), onClick: () => dialogsRef.current?.openDialog('earning_new') }}
      disabledDeletion={quest.earnings.length === 0}
      disabledImport={Object.keys(quests).length <= 1}
    >
      <QuestEarningsTable quest={quest} setEarningIndex={setEarningIndex} />
    </DataBlockEditor>
  );
};
