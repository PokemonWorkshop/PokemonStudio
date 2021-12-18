import ItemModel from '@modelEntities/item/Item.model';
import TechItemModel from '@modelEntities/item/TechItem.model';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemTechDataProps = { item: ItemModel; onClick: () => void };

const getMoveName = (state: State, techItem: TechItemModel, t: TFunction<('database_items' | 'database_moves')[]>): string => {
  const move = state.projectData.moves[techItem.move];

  return move ? move.name() : t('database_moves:move_deleted');
};

export const ItemTechData = ({ item, onClick }: ItemTechDataProps) => {
  const { t } = useTranslation(['database_items', 'database_moves']);
  const [state] = useGlobalState();
  const techItem = item instanceof TechItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('tech');

  return (
    <DataBlockWithTitle size="fourth" title={t('database_items:techniques')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('database_items:machines_category')}
            data={techItem ? t(`database_items:${techItem.isHm ? 'hm' : 'tm'}`) : '---'}
            disabled={techItem ? false : true}
          />
          <DataFieldsetField
            label={t('database_items:move_learnt')}
            data={techItem ? getMoveName(state, techItem, t) : '---'}
            disabled={techItem ? false : true}
            error={techItem ? !state.projectData.moves[techItem.move] : false}
          />
          <DataFieldsetField label={t('database_items:fling')} data={item.flingPower} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
