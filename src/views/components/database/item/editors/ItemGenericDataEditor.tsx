import React, { forwardRef, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { useItemPage } from '@hooks/usePage';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateItem } from './useUpdateItem';
import { cloneEntity } from '@utils/cloneEntity';
// Fork: socket selection + custom-socket management is owned by ItemSocketField
// in src/custom/ItemSocket so upstream pulls of this editor stay conflict-free.
import { ItemSocketField } from '@src/custom/ItemSocket/ItemSocketField';

export const ItemGenericDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem, items } = useItemPage();
  const { t } = useTranslation();
  const item = cloneEntity(currentItem);
  const updateItem = useUpdateItem(currentItem);

  const [socket, setSocket] = useState<string>(item.socket.toString());
  const [socketBusy, setSocketBusy] = useState(false);

  const priceRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);

  const canClose = () =>
    !socketBusy &&
    !!priceRef.current &&
    priceRef.current.validity.valid &&
    !!positionRef.current &&
    positionRef.current.validity.valid;

  const onClose = () => {
    const changes = {
      price: priceRef.current && !isNaN(priceRef.current.valueAsNumber) ? priceRef.current.valueAsNumber : item.price,
      position: positionRef.current && !isNaN(positionRef.current.valueAsNumber) ? positionRef.current.valueAsNumber : item.position,
      socket: Number(socket),
    };

    updateItem(changes);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('generic') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('data')}>
      <InputContainer>
        <ItemSocketField value={socket} onChange={setSocket} onBusyChange={setSocketBusy} />
        <InputWithLeftLabelContainer>
          <Label htmlFor="price">{t('price')}</Label>
          <Input type="number" name="price" defaultValue={item.price} min="0" max="999999999" ref={priceRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="position">{t('order_sort')}</Label>
          <Input type="number" name="position" min="0" max={Object.keys(items).length} defaultValue={item.position} ref={positionRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemGenericDataEditor.displayName = 'ItemGenericDataEditor';
