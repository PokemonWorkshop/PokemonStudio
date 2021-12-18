import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import {
  Input,
  InputContainer,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import ItemModel from '@modelEntities/item/Item.model';
import BallItemModel from '@modelEntities/item/BallItem.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { colorToHex, hexToColor } from '@utils/ColorUtils';

type ItemCatchDataEditorProps = {
  item: ItemModel;
};

export const ItemCatchDataEditor = ({ item }: ItemCatchDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const ballItem = item instanceof BallItemModel ? item : undefined;

  return item.lockedEditors.includes('catch') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('catch')}>
      {ballItem && (
        <InputContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="catch_rate">{t('catch_rate')}</Label>
            <Input
              type="number"
              name="catch_rate"
              value={isNaN(ballItem.catchRate) ? '' : ballItem.catchRate}
              min="0"
              max="255"
              step="0.1"
              onChange={(event) => {
                const newValue = event.target.value == '' ? Number.NaN : Number(event.target.value);
                if (newValue < 0 || newValue > 255) return event.preventDefault();
                refreshUI((ballItem.catchRate = newValue));
              }}
              onBlur={() => refreshUI((ballItem.catchRate = cleanNaNValue(ballItem.catchRate)))}
            />
          </InputWithLeftLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="spritesheet" required>
              {t('spritesheet')}
            </Label>
            <Input
              type="text"
              name="spritesheet"
              value={ballItem.spriteFilename}
              onChange={(event) => refreshUI((ballItem.spriteFilename = event.target.value))}
              placeholder="ball_1"
            />
          </InputWithTopLabelContainer>
          <InputWithColorLabelContainer>
            <Label htmlFor="color">{t('color')}</Label>
            <Input
              type="color"
              name="color"
              value={colorToHex(ballItem.color)}
              onChange={(event) => refreshUI((ballItem.color = hexToColor(event.target.value)))}
            />
          </InputWithColorLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
};
