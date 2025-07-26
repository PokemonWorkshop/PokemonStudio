import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldgroup, DataFieldgroupField, DataFieldsetField, DataGrid } from '../dataBlocks';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useItemPage } from '@hooks/usePage';

type ItemCookingDataProps = { dialogsRef: ItemDialogsRef };

export const ItemCookingData = ({ dialogsRef }: ItemCookingDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation();
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('cooking');

  return (
    <DataBlockWithTitle
      size="half"
      title={t('cooking_title')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('cooking')}
    >
      {!isDisabled && (
        <DataGrid columns="152px 1fr" rows="1fr">
          <DataFieldgroup title="">
            <DataFieldsetField label={t('pokeblock_color')} data={item.cookingData != null ? t(`${item.cookingData.color}`) : '---'} />
            <DataFieldsetField
              label={t('berries_better_pokeblock')}
              data={item.cookingData != null ? t('berry_better_pokeblock', { chance: item.cookingData.betterPokeblockChance }) : '---'}
            />
            <DataFieldsetField label={t('smoothness')} data={item.cookingData != null ? item.cookingData.smoothness : '---'} />
          </DataFieldgroup>
          <DataFieldgroup title={t('flavors')}>
            <DataFieldgroupField
              label={t('spicy')}
              data={item.cookingData != null ? item.cookingData.flavors[0] : '---'}
              width="117px"
              key={'spicy'}
            />
            <DataFieldgroupField label={t('dry')} data={item.cookingData != null ? item.cookingData.flavors[1] : '---'} width="117px" key={'dry'} />
            <DataFieldgroupField
              label={t('sweet')}
              data={item.cookingData != null ? item.cookingData.flavors[2] : '---'}
              width="117px"
              key={'sweet'}
            />
            <DataFieldgroupField
              label={t('bitter')}
              data={item.cookingData != null ? item.cookingData.flavors[3] : '---'}
              width="117px"
              key={'bitter'}
            />
            <DataFieldgroupField label={t('sour')} data={item.cookingData != null ? item.cookingData.flavors[4] : '---'} width="117px" key={'sour'} />
          </DataFieldgroup>
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
