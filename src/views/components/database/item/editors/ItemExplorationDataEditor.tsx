import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import ItemModel from '@modelEntities/item/Item.model';
import RepelItemModel from '@modelEntities/item/RepelItem.model';
import EventItemModel from '@modelEntities/item/EventItem.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type ItemExplorationDataEditorProps = {
  item: ItemModel;
};

export const ItemExplorationDataEditor = ({ item }: ItemExplorationDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const repelItem = item instanceof RepelItemModel ? item : undefined;
  const eventItem = item instanceof EventItemModel ? item : undefined;

  return item.lockedEditors.includes('exploration') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('event')}>
      <InputContainer>
        {repelItem && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="step_number">{t('step_number')}</Label>
            <Input
              type="number"
              name="step_number"
              value={isNaN(repelItem.repelCount) ? '' : repelItem.repelCount}
              min="0"
              max="99999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < 0 || value > 99_999) return event.preventDefault();
                refreshUI((repelItem.repelCount = value));
              }}
              onBlur={() => refreshUI((repelItem.repelCount = cleanNaNValue(repelItem.repelCount)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {eventItem && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="common_event_id">{t('common_event_id')}</Label>
            <Input
              type="number"
              name="common_event_id"
              value={isNaN(eventItem.eventId) ? '' : eventItem.eventId}
              min="0"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < 0 || value > 999) return event.preventDefault();
                refreshUI((eventItem.eventId = value));
              }}
              onBlur={() => refreshUI((eventItem.eventId = cleanNaNValue(eventItem.eventId)))}
            />
          </InputWithLeftLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
