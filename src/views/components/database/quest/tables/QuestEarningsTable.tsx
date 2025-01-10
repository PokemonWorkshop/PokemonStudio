import React from 'react';
import { DataEarningGrid, DataQuestTable, TableEmpty } from './QuestTableStyle';
import { useTranslation } from 'react-i18next';
import { RenderEarning } from './RenderEarning';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioQuest } from '@modelEntities/quest';
import { useUpdateQuest } from '../editors/useUpdateQuest';

type QuestEarningsTableProps = {
  quest: StudioQuest;
  editEarning: (index: number) => void;
};

export const QuestEarningsTable = ({ quest, editEarning }: QuestEarningsTableProps) => {
  const updateQuest = useUpdateQuest(quest);
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
          onClickEdit={() => editEarning(index)}
          onClickDelete={() => {
            const newEarnings = cloneEntity(quest.earnings);
            newEarnings.splice(index, 1);
            updateQuest({ earnings: newEarnings });
          }}
        />
      ))}
    </DataQuestTable>
  );
};
