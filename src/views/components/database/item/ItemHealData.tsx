import HealingItemModel from '@modelEntities/item/HealingItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import StatusConstantHealItemModel from '@modelEntities/item/StatusConstantHealItem.model';
import StatusHealItemModel, { getHealedStatus } from '@modelEntities/item/StatusHealItem.model';
import StatusRateHealItemModel from '@modelEntities/item/StatusRateHealItem.model';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemHealDataProps = { item: ItemModel; onClick: () => void };

const getHealValue = (t: TFunction<'database_items'>, healItem: HealingItemModel): string => {
  if (healItem instanceof StatusHealItemModel) return t(getHealedStatus(healItem.statusList) as never);
  if (healItem instanceof StatusRateHealItemModel || healItem instanceof StatusConstantHealItemModel) {
    return `${healItem.getHealValue()} & ${t(getHealedStatus(healItem.statusList) as never)}`;
  }

  return healItem.getHealValue();
};

export const ItemHealData = ({ item, onClick }: ItemHealDataProps) => {
  const { t } = useTranslation('database_items');
  const healItem = item instanceof HealingItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('heal');

  return (
    <DataBlockWithTitle size="fourth" title={t('heal')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && healItem && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('heal_category')} data={t(healItem.klass as never)} />
          <DataFieldsetField label={t('value')} data={getHealValue(t, healItem)} />
          <DataFieldsetField label={t('hapiness_malus')} data={healItem.loyaltyMalus} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
