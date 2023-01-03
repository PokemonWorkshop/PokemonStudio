import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';

type ItemExplorationDataProps = { item: StudioItem; onClick: () => void };

export const ItemExplorationData = ({ item, onClick }: ItemExplorationDataProps) => {
  const { t } = useTranslation('database_items');
  const isItemRepel = item.klass === 'RepelItem';
  const isItemEvent = item.klass === 'EventItem';
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('exploration');

  return (
    <DataBlockWithTitle size="fourth" title={t('event')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('step_number')} data={isItemRepel ? item.repelCount : '---'} disabled={!isItemRepel} />
          <DataFieldsetField label={t('common_event_id')} data={(isItemEvent && item.eventId) || '---'} disabled={!isItemEvent} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
