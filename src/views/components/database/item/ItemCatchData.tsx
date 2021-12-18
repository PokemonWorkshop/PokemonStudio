import BallItemModel, { Color } from '@modelEntities/item/BallItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { DataFieldsetFieldCode } from '../dataBlocks/DataFieldsetField';

type ItemCatchDataProps = { item: ItemModel; onClick: () => void };

const colorToString = (color: Color) => `${color.red}, ${color.green}, ${color.blue}, ${color.alpha}`;

export const ItemCatchData = ({ item, onClick }: ItemCatchDataProps) => {
  const { t } = useTranslation('database_items');
  const ballItem = item instanceof BallItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('catch');
  return (
    <DataBlockWithTitle size="fourth" title={t('catch')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && ballItem && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('catch_rate')} data={ballItem.catchRate} />
          <DataFieldsetFieldCode label={t('spritesheet')} data={`${ballItem.spriteFilename}.png`} />
          <DataFieldsetFieldCode label={t('color')} data={colorToString(ballItem.color)} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
