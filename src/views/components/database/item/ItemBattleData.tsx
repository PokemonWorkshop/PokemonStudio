import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useItemPage } from '@utils/usePage';

type ItemBattleDataProps = { dialogsRef: ItemDialogsRef };

export const ItemBattleData = ({ dialogsRef }: ItemBattleDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isStatBoostItem = item.klass === 'StatBoostItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('battle');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('battle')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('battle')}
    >
      {!isDisabled && isStatBoostItem && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('statistic')} data={t(item.stat)} />
          <DataFieldsetField label={t('value')} data={item.count} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
