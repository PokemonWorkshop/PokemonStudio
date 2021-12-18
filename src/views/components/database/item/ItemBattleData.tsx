import ItemModel from '@modelEntities/item/Item.model';
import StatBoostItemModel from '@modelEntities/item/StatBoostItem.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemBattleDataProps = { item: ItemModel; onClick: () => void };

export const ItemBattleData = ({ item, onClick }: ItemBattleDataProps) => {
  const { t } = useTranslation('database_items');
  const statBoostItem = item instanceof StatBoostItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('battle');

  return (
    <DataBlockWithTitle size="fourth" title={t('battle')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && statBoostItem && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('statistic')} data={t(statBoostItem.stat as never)} />
          <DataFieldsetField label={t('value')} data={statBoostItem.count} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
