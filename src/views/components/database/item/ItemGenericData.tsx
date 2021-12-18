import ItemModel from '@modelEntities/item/Item.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemGenericDataProps = { item: ItemModel; onClick: () => void };

export const ItemGenericData = ({ item, onClick }: ItemGenericDataProps) => {
  const { t } = useTranslation('database_items');
  const isDisabled = item.lockedEditors.includes('generic');
  return (
    <DataBlockWithTitle size="fourth" title={t('data')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('item_socket')} data={item.pocketName()} />
          <DataFieldsetField label={t('price')} data={`${item.price} P$`} disabled={item.price === 0} />
          <DataFieldsetField label={t('order_sort')} data={item.position} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
