import React, { useMemo } from 'react';
import { DataEarningGrid, DataQuestTable, TableEmpty } from './QuestTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectQuests } from '@hooks/useProjectData';
import { RenderEarning } from './RenderEarning';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioQuest } from '@modelEntities/quest';

type QuestEarningsTableProps = {
  quest: StudioQuest;
  onEdit: (index: number) => void;
};

export const QuestEarningsTable = ({ quest, onEdit }: QuestEarningsTableProps) => {
  const { setProjectDataValues: setQuest } = useProjectQuests();
  const currentEditedQuest = useMemo(() => cloneEntity(quest), [quest]);
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
