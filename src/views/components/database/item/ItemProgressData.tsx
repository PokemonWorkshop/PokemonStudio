import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useItemPage } from '@hooks/usePage';

type ItemProgressDataProps = { dialogsRef: ItemDialogsRef };

export const ItemProgressData = ({ dialogsRef }: ItemProgressDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isItemEvBoost = item.klass === 'EVBoostItem';
  const isItemLevelBoost = item.klass === 'LevelIncreaseItem';
  const isItemExpBoost = item.klass === 'ExpGiveItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('progress');

  console.log(isItemEvBoost, isItemExpBoost, isItemLevelBoost);

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('progress_title')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('progress')}
    >
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('progress_category')}
            data={t(isItemEvBoost ? 'EV_PROGRESS' : isItemLevelBoost ? 'LEVEL_PROGRESS' : 'EXP_PROGRESS')}
          />
          <DataFieldsetField label={t('progress_stat')} data={isItemEvBoost ? t(`${item.stat}_STAGE`) : '---'} disabled={!isItemEvBoost} />
          <DataFieldsetField
            label={t('value')}
            data={
              isItemEvBoost
                ? item.count
                : isItemLevelBoost
                ? ('levelCount' in item && item.levelCount) || '0'
                : ('expCount' in item && item.expCount) || '0'
            }
          />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
