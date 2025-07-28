import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';
import { useItemPage } from '@hooks/usePage';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectDataReadonly } from '@src/hooks/useProjectData';

type ItemBerriesDataProps = { dialogsRef: ItemDialogsRef };

export const ItemBerriesData = ({ dialogsRef }: ItemBerriesDataProps) => {
  const { currentItem: item } = useItemPage();
  const { projectDataValues: types } = useProjectDataReadonly('types', 'type');
  const getTypeName = useGetEntityNameTextUsingTextId();
  const { t } = useTranslation();
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('berries') || !item.isBerry;

  return (
    <DataBlockWithTitle
      size="half"
      title={t('berries_title')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('berries')}
    >
      {!isDisabled && (
        <DataGrid columns="152px 1fr" rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('berries_size')} data={item.berryData != null ? t('berry_size', { size: item.berryData.size }) : '---'} />
          <DataFieldsetField label={t('berries_firmness')} data={item.berryData != null ? t(`firmness_${item.berryData.firmness}`) : '---'} />
          <DataFieldsetField
            label={t('berries_yield')}
            data={
              item.berryData != null
                ? item.berryData.minYield === item.berryData.maxYield
                  ? item.berryData.minYield.toString()
                  : t('berry_yield', { min: item.berryData.minYield, max: item.berryData.maxYield })
                : '---'
            }
          />
          <DataFieldsetField
            label={t('berries_growth')}
            data={item.berryData != null ? t('berry_growth', { growth: item.berryData.growth }) : '---'}
          />
          <DataFieldsetField
            label={t('berries_drain_rate')}
            data={item.berryData != null ? t('berry_drain_rate', { drain_rate: item.berryData.drainRate }) : '---'}
          />
          <DataFieldsetField
            label={t('berries_natural_gift')}
            data={item.berryData != null ? `${getTypeName(types[item.berryData.naturalGiftType])} (${item.berryData.naturalGiftPower})` : '---'}
          />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
