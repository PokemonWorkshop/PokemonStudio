import React, { useMemo } from 'react';
import QuestModel from '@modelEntities/quest/Quest.model';
import { DataEarningGrid, DataQuestTable, TableEmpty } from './QuestTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectQuests } from '@utils/useProjectData';
import { RenderEarning } from './RenderEarning';

type QuestEarningsTableProps = {
  quest: QuestModel;
  onEdit: (index: number) => void;
};

export const QuestEarningsTable = ({ quest, onEdit }: QuestEarningsTableProps) => {
  const { setProjectDataValues: setQuest } = useProjectQuests();
  const currentEditedQuest = useMemo(() => quest.clone(), [quest]);
  const { t } = useTranslation('database_quests');

  return quest.earnings.length === 0 ? (
    <TableEmpty>{t('no_earning')}</TableEmpty>
  ) : (
    <DataQuestTable>
      <DataEarningGrid gap="48px" className="header">
        <span>{t('earning_type')}</span>
        <span>{t('category')}</span>
      </DataEarningGrid>
      {quest.earnings.map((earning, index) => (
        <RenderEarning
          key={`earning-${index}`}
          earning={earning}
          onClickEdit={() => {
            onEdit(index);
          }}
          onClickDelete={() => {
            currentEditedQuest.earnings.splice(index, 1);
            setQuest({ [quest.dbSymbol]: currentEditedQuest });
          }}
        />
      ))}
    </DataQuestTable>
  );
};
