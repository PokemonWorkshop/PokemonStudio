import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { pocketMapping, useGetProjectText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ITEM_POCKET_NAME_TEXT_ID, LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { useItemPage } from '@utils/usePage';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateItem } from './useUpdateItem';
import { cloneEntity } from '@utils/cloneEntity';

const pocketOptions = (getText: ReturnType<typeof useGetProjectText>) =>
  pocketMapping
    .slice(1)
    .map((i) => ({ value: i.toString(), label: getText(ITEM_POCKET_NAME_TEXT_ID, i) }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const ItemGenericDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem, items } = useItemPage();
  const { t } = useTranslation('database_items');
  const item = cloneEntity(currentItem);
  const updateItem = useUpdateItem(currentItem);
  const getText = useGetProjectText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => pocketOptions(getText), [item]);

  const [socketLabel, setSocketLabel] = useState((pocketMapping[item.socket] ?? item.socket).toString());
  const [socket, setSocket] = useState(item.socket);

  const priceRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);

  const canClose = () => !!priceRef.current && priceRef?.current.validity.valid && !!positionRef.current && positionRef?.current.validity.valid;

  const onClose = () => {
    const changes = {
      price: priceRef.current && !isNaN(priceRef.current.valueAsNumber) ? priceRef.current.valueAsNumber : item.price,
      position: positionRef.current && !isNaN(positionRef.current.valueAsNumber) ? positionRef.current.valueAsNumber : item.position,
      socket: socket,
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
          <SelectCustomSimple
            id="select-item-socket"
            options={options}
            value={socketLabel.toString()}
            onChange={(value) => {
              // indexOf 0 if u want to select Medecine item
              const newValue: number = pocketMapping.indexOf(Number(value), value === '0' ? 0 : 1);
              setSocket(newValue);
              setSocketLabel(value);
            }}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="price">{t('price')}</Label>
          <Input type="number" name="price" defaultValue={item.price} min="0" max="999999999" ref={priceRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="position">{t('order_sort')}</Label>
          <Input type="number" name="position" min="0" max={Object.entries(items).length} defaultValue={item.position} ref={positionRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemGenericDataEditor.displayName = 'ItemGenericDataEditor';
