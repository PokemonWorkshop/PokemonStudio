import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemProgressDataProps = { item: StudioItem; onClick: () => void };

export const ItemProgressData = ({ item, onClick }: ItemProgressDataProps) => {
  const { t } = useTranslation('database_items');
  const isItemEvBoost = item.klass === 'EVBoostItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('progress');
  return (
    <DataBlockWithTitle size="fourth" title={t('progress_title')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('progress_category')} data={t(isItemEvBoost ? 'EV_PROGRESS' : 'LEVEL_PROGRESS')} />
          <DataFieldsetField label={t('progress_stat')} data={isItemEvBoost ? t(`${item.stat}_STAGE`) : '---'} disabled={!isItemEvBoost} />
          <DataFieldsetField label={t('value')} data={isItemEvBoost ? item.count : ('levelCount' in item && item.levelCount) || '0'} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
