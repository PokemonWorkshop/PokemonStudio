import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import {
  Input,
  InputContainer,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import { colorToHex, hexToColor } from '@utils/ColorUtils';
import { LOCKED_ITEM_EDITOR, StudioBallItem } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@utils/usePage';
import { useUpdateItem } from './useUpdateItem';

export const ItemCatchDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const item = currentItem as StudioBallItem;

  const { t } = useTranslation('database_items');
  const setItems = useUpdateItem(item);

  const catchRateRef = useRef<HTMLInputElement>(null);
  const spriteFilenameRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState(item.color);

  const canClose = () => {
    if (!!spriteFilenameRef.current && !spriteFilenameRef.current?.validity.valid) return false;
    if (!!catchRateRef.current && !catchRateRef.current?.validity.valid) return false;

    return true;
  };

  const handleClose = () => {
    if (!spriteFilenameRef.current || !spriteFilenameRef.current.value || !canClose()) return;

    const catchRate =
      catchRateRef?.current && !isNaN(catchRateRef?.current?.valueAsNumber) && catchRateRef.current?.validity.valid
        ? catchRateRef?.current?.valueAsNumber
        : item.catchRate;
    setItems({
      catchRate,
      spriteFilename: spriteFilenameRef.current.value,
      color: color,
    } as Partial<StudioBallItem>);
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('catch') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('catch')}>
      {item.klass === 'BallItem' && (
        <InputContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="catch_rate">{t('catch_rate')}</Label>
            <Input type="number" name="catchRate" defaultValue={item.catchRate} min="0" max="255" step="0.1" ref={catchRateRef} />
          </InputWithLeftLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="spritesheet" required>
              {t('spritesheet')}
            </Label>
            <Input type="text" required name="spriteFilename" defaultValue={item.spriteFilename} ref={spriteFilenameRef} placeholder="ball_1" />
          </InputWithTopLabelContainer>
          <InputWithColorLabelContainer>
            <Label htmlFor="color">{t('color')}</Label>
            <Input type="color" name="color" value={colorToHex(color)} onChange={(event) => setColor(hexToColor(event.target.value))} />
          </InputWithColorLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
});
ItemCatchDataEditor.displayName = 'ItemCatchDataEditor';
