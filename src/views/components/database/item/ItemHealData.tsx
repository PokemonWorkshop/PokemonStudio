import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { useItemPage } from '@hooks/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemHealDataProps = { dialogsRef: ItemDialogsRef };

const getHealValue = (t: TFunction, item: Extract<StudioItem, { loyaltyMalus: number }>): string => {
  // Fork: combined stat-boost + heal item carries both hpCount and hpRate; show
  // the one selected by hpMode. (Must come before the generic hpCount check.)
  if (item.klass === 'StatBoostAndHealItem') {
    return item.hpMode === 'rate' ? `${(item.hpRate * 100).toFixed(1)}%` : item.hpCount.toString();
  }
  if ('hpCount' in item) {
    if ('statusList' in item) {
      return `${item.hpCount} & ${item.statusList.map((statusKey) => t(statusKey)).join(', ')}`;
    }
    return item.hpCount.toString();
  }
  if ('hpRate' in item) {
    if ('statusList' in item) {
      return `${(item.hpRate * 100).toFixed(1)}% & ${item.statusList.map((statusKey) => t(statusKey)).join(', ')}`;
    }
    return `${(item.hpRate * 100).toFixed(1)}%`;
  }
  if ('statusList' in item) return item.statusList.map((statusKey) => t(statusKey)).join(', ');
  if (item.klass === 'StatBoostItem') return t(item.stat);
  if (item.klass === 'EVBoostItem') return t(`${item.stat}_STAGE`);
  if (item.klass === 'PPIncreaseItem') return item.isMax ? 'Max' : '+20%';
  if ('ppCount' in item) return item.ppCount.toString();

  return '???';
};

export const ItemHealData = ({ dialogsRef }: ItemHealDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation();
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('heal');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('heal')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('heal')}
    >
      {!isDisabled && 'loyaltyMalus' in item && (
        <DataGrid rows="auto 1fr auto">
          <DataFieldsetField label={t('heal_category')} data={t(item.klass)} />
          <DataFieldsetField label={t('value')} data={getHealValue(t, item)} />
          <DataFieldsetField label={t('happiness_malus')} data={item.loyaltyMalus} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
