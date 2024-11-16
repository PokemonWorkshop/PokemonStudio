import { LOCKED_ITEM_EDITOR, StudioTechItem } from '@modelEntities/item';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { getEntityNameText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { useShortcutNavigation } from '@hooks/useShortcutNavigation';
import { useKeyPress, CONTROL } from '@hooks/useKeyPress';
import { useItemPage } from '@hooks/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemTechDataProps = { dialogsRef: ItemDialogsRef };

const getMoveName = (state: State, techItem: StudioTechItem, t: TFunction<('database_items' | 'database_moves')[]>): string => {
  const move = state.projectData.moves[techItem.move];

  return move ? getEntityNameText(move, state) : t('database_moves:move_deleted');
};

export const ItemTechData = ({ dialogsRef }: ItemTechDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation(['database_items', 'database_moves']);
  const [state] = useGlobalState();
  const isItemTech = item.klass === 'TechItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('tech');
  const moveName = isItemTech ? getMoveName(state, item, t) : '---';

  const isClickable: boolean = useKeyPress(CONTROL) && moveName !== t('database_moves:move_deleted');
  const shortcutNavigation = useShortcutNavigation('moves', 'move', '/database/moves/');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('database_items:techniques')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('tech')}
    >
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('database_items:machines_category')}
            data={isItemTech ? t(`database_items:${item.isHm ? 'hm' : 'tm'}`) : '---'}
            disabled={!isItemTech}
          />
          <DataFieldsetField
            label={t('database_items:move_learnt')}
            data={moveName}
            disabled={!isItemTech}
            error={isItemTech ? !state.projectData.moves[item.move] : false}
            clickable={{ isClickable, callback: () => (isItemTech ? shortcutNavigation(state.projectData.moves[item.move]?.dbSymbol) : null) }}
          />
          <DataFieldsetField label={t('database_items:fling')} data={item.flingPower} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
