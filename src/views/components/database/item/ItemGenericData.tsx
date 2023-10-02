import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { useGetItemPocketText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { useItemPage } from '@utils/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemGenericDataProps = { dialogsRef: ItemDialogsRef };

export const ItemGenericData = ({ dialogsRef }: ItemGenericDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const getPocketName = useGetItemPocketText();
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('generic');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('data')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('generic')}
    >
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('item_socket')} data={getPocketName(item)} />
          <DataFieldsetField label={t('price')} data={`${item.price} P$`} disabled={item.price === 0} />
          <DataFieldsetField label={t('order_sort')} data={item.position} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
