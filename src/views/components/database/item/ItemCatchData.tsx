import { LOCKED_ITEM_EDITOR, StudioBallItem } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { DataFieldsetFieldCode } from '../dataBlocks/DataFieldsetField';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useItemPage } from '@hooks/usePage';

type ItemCatchDataProps = { dialogsRef: ItemDialogsRef };

const colorToString = (color: StudioBallItem['color']) => `${color.red}, ${color.green}, ${color.blue}, ${color.alpha}`;

export const ItemCatchData = ({ dialogsRef }: ItemCatchDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('catch');
  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('catch')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('catch')}
    >
      {!isDisabled && item.klass === 'BallItem' && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('catch_rate')} data={item.catchRate} />
          <DataFieldsetFieldCode label={t('spritesheet')} data={`${item.spriteFilename}.png`} />
          <DataFieldsetFieldCode label={t('color')} data={colorToString(item.color)} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
