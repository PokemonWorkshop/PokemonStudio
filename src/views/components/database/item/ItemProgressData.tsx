import EVBoostItemModel from '@modelEntities/item/EVBoostItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import LevelIncreaseItemModel from '@modelEntities/item/LevelIncreaseItem.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemProgressDataProps = { item: ItemModel; onClick: () => void };

export const ItemProgressData = ({ item, onClick }: ItemProgressDataProps) => {
  const { t } = useTranslation('database_items');
  const evItem = item instanceof EVBoostItemModel ? item : undefined;
  const levelItem = item instanceof LevelIncreaseItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('progress');
  return (
    <DataBlockWithTitle size="fourth" title={t('progress_title')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('progress_category')} data={t(evItem ? 'EV_PROGRESS' : 'LEVEL_PROGRESS')} />
          <DataFieldsetField label={t('progress_stat')} data={evItem ? t(`${evItem.stat}_STAGE` as never) : '---'} disabled={evItem ? false : true} />
          <DataFieldsetField label={t('value')} data={evItem ? evItem.count : levelItem?.levelCount || '0'} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
