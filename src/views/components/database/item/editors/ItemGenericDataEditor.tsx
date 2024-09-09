import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useGetItemPocketText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ITEM_SOCKET_LIST, LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { useItemPage } from '@hooks/usePage';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateItem } from './useUpdateItem';
import { cloneEntity } from '@utils/cloneEntity';

const pocketOptions = (getItemPocketText: ReturnType<typeof useGetItemPocketText>) =>
  ITEM_SOCKET_LIST.map((i) => ({ value: i.toString(), label: getItemPocketText({ klass: 'Item', socket: i }) })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

export const ItemGenericDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem, items } = useItemPage();
  const { t } = useTranslation('database_items');
  const item = cloneEntity(currentItem);
  const updateItem = useUpdateItem(currentItem);
  const getItemPocketText = useGetItemPocketText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => pocketOptions(getItemPocketText), [item]);
  const [socket, setSocket] = useState<string>(item.socket.toString());
  const priceRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);

  const canClose = () => !!priceRef.current && priceRef?.current.validity.valid && !!positionRef.current && positionRef?.current.validity.valid;

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
        <InputWithTopLabelContainer>
          <Label>{t('item_socket')} </Label>
          <SelectCustomSimple id="select-item-socket" options={options} value={socket} onChange={setSocket} noTooltip />
        </InputWithTopLabelContainer>
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
