import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';

type ItemExplorationDataEditorProps = {
  item: StudioItem;
};

export const ItemExplorationDataEditor = ({ item }: ItemExplorationDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const isItemRepel = item.klass === 'RepelItem';
  const isItemEvent = item.klass === 'EventItem';

  return LOCKED_ITEM_EDITOR[item.klass].includes('exploration') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('event')}>
      <InputContainer>
        {isItemRepel && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="step_number">{t('step_number')}</Label>
            <Input
              type="number"
              name="step_number"
              value={isNaN(item.repelCount) ? '' : item.repelCount}
              min="0"
              max="99999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < 0 || value > 99_999) return event.preventDefault();
                refreshUI((item.repelCount = value));
              }}
              onBlur={() => refreshUI((item.repelCount = cleanNaNValue(item.repelCount)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {isItemEvent && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="common_event_id">{t('common_event_id')}</Label>
            <Input
              type="number"
              name="common_event_id"
              value={isNaN(item.eventId) ? '' : item.eventId}
              min="0"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < 0 || value > 999) return event.preventDefault();
                refreshUI((item.eventId = value));
              }}
              onBlur={() => refreshUI((item.eventId = cleanNaNValue(item.eventId)))}
            />
          </InputWithLeftLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
