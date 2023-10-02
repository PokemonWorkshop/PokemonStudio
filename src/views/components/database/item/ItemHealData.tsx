import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { getHealedStatus } from './editors/ItemHealDataEditor';
import { useItemPage } from '@utils/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemHealDataProps = { dialogsRef: ItemDialogsRef };

const getHealValue = (t: TFunction<'database_items'>, item: Extract<StudioItem, { loyaltyMalus: number }>): string => {
  if ('hpCount' in item) {
    if ('statusList' in item) {
      return `${item.hpCount} & ${t(getHealedStatus(item.statusList))}`;
    }
    return item.hpCount.toString();
  }
  if ('hpRate' in item) {
    if ('statusList' in item) {
      return `${(item.hpRate * 100).toFixed(1)}% & ${t(getHealedStatus(item.statusList))}`;
    }
    return `${(item.hpRate * 100).toFixed(1)}%`;
  }
  if ('statusList' in item) return t(getHealedStatus(item.statusList));
  if (item.klass === 'StatBoostItem') return t(item.stat);
  if (item.klass === 'EVBoostItem') return t(`${item.stat}_STAGE`);
  if (item.klass === 'PPIncreaseItem') return item.isMax ? 'Max' : '+20%';
  if ('ppCount' in item) return item.ppCount.toString();

  return '???';
};

export const ItemHealData = ({ dialogsRef }: ItemHealDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('heal');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('heal')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('heal')}
    >
      {!isDisabled && 'loyaltyMalus' in item && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('heal_category')} data={t(item.klass)} />
          <DataFieldsetField label={t('value')} data={getHealValue(t, item)} />
          <DataFieldsetField label={t('hapiness_malus')} data={item.loyaltyMalus} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
