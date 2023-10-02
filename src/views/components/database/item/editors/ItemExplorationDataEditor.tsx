import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { LOCKED_ITEM_EDITOR, StudioEventItem, StudioRepelItem } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@utils/usePage';
import { useUpdateItem } from './useUpdateItem';

export const ItemExplorationDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const setItems = useUpdateItem(item);

  const isItemRepel: boolean = item.klass === 'RepelItem';
  const isItemEvent: boolean = item.klass === 'EventItem';

  const repelCountRef = useRef<HTMLInputElement>(null);
  const eventIdRef = useRef<HTMLInputElement>(null);

  const canClose = () => {
    if (isItemRepel) return !!repelCountRef.current && repelCountRef?.current.validity.valid;
    if (isItemEvent) return !!eventIdRef.current && eventIdRef?.current.validity.valid;
    return true;
  };

  const handleClose = () => {
    if (isItemRepel) {
      setItems({
        repelCount:
          repelCountRef.current && !isNaN(repelCountRef.current.valueAsNumber) && repelCountRef.current.validity.valid
            ? repelCountRef.current.valueAsNumber
            : (item as StudioRepelItem).repelCount,
      });
    }
    if (isItemEvent) {
      setItems({
        eventId:
          eventIdRef.current && !isNaN(eventIdRef.current.valueAsNumber) && eventIdRef.current.validity.valid
            ? eventIdRef.current.valueAsNumber
            : (item as StudioEventItem).eventId,
      });
    }
    return;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('exploration') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('event')}>
      <InputContainer>
        {isItemRepel && 'repelCount' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="step_number">{t('step_number')}</Label>
            <Input type="number" name="step_number" defaultValue={item.repelCount} min="1" max="99999" ref={repelCountRef} />
          </InputWithLeftLabelContainer>
        )}
        {isItemEvent && 'eventId' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="common_event_id">{t('common_event_id')}</Label>
            <Input type="number" name="common_event_id" defaultValue={item.eventId} min="1" max="999" ref={eventIdRef} />
          </InputWithLeftLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
ItemExplorationDataEditor.displayName = 'ItemExplorationDataEditor';
