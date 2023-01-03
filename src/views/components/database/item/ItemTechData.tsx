import { LOCKED_ITEM_EDITOR, StudioItem, StudioTechItem } from '@modelEntities/item';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { getEntityNameText } from '@utils/ReadingProjectText';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemTechDataProps = { item: StudioItem; onClick: () => void };

const getMoveName = (state: State, techItem: StudioTechItem, t: TFunction<('database_items' | 'database_moves')[]>): string => {
  const move = state.projectData.moves[techItem.move];

  return move ? getEntityNameText(move, state) : t('database_moves:move_deleted');
};

export const ItemTechData = ({ item, onClick }: ItemTechDataProps) => {
  const { t } = useTranslation(['database_items', 'database_moves']);
  const [state] = useGlobalState();
  const isItemTech = item.klass === 'TechItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('tech');

  return (
    <DataBlockWithTitle size="fourth" title={t('database_items:techniques')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('database_items:machines_category')}
            data={isItemTech ? t(`database_items:${item.isHm ? 'hm' : 'tm'}`) : '---'}
            disabled={!isItemTech}
          />
          <DataFieldsetField
            label={t('database_items:move_learnt')}
            data={isItemTech ? getMoveName(state, item, t) : '---'}
            disabled={!isItemTech}
            error={isItemTech ? !state.projectData.moves[item.move] : false}
          />
          <DataFieldsetField label={t('database_items:fling')} data={item.flingPower} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
