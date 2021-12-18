import EventItemModel from '@modelEntities/item/EventItem.model';
import ItemModel from '@modelEntities/item/Item.model';
import RepelItemModel from '@modelEntities/item/RepelItem.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemExplorationDataProps = { item: ItemModel; onClick: () => void };

export const ItemExplorationData = ({ item, onClick }: ItemExplorationDataProps) => {
  const { t } = useTranslation('database_items');
  const repelItem = item instanceof RepelItemModel ? item : undefined;
  const eventItem = item instanceof EventItemModel ? item : undefined;
  const isDisabled = item.lockedEditors.includes('exploration');

  return (
    <DataBlockWithTitle size="fourth" title={t('event')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('step_number')} data={repelItem ? repelItem.repelCount : '---'} disabled={repelItem ? false : true} />
          <DataFieldsetField label={t('common_event_id')} data={(eventItem && eventItem.eventId) || '---'} disabled={eventItem ? false : true} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
