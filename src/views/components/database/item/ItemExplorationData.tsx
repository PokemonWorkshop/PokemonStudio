import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { useItemPage } from '@utils/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemExplorationDataProps = { dialogsRef: ItemDialogsRef };

export const ItemExplorationData = ({ dialogsRef }: ItemExplorationDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isItemRepel = item.klass === 'RepelItem';
  const isItemEvent = item.klass === 'EventItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('exploration');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('event')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('exploration')}
    >
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('step_number')} data={isItemRepel ? item.repelCount : '---'} disabled={!isItemRepel} />
          <DataFieldsetField label={t('common_event_id')} data={(isItemEvent && item.eventId) || '---'} disabled={!isItemEvent} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
