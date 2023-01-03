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
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { colorToHex, hexToColor } from '@utils/ColorUtils';
import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';

type ItemCatchDataEditorProps = {
  item: StudioItem;
};

export const ItemCatchDataEditor = ({ item }: ItemCatchDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();

  return LOCKED_ITEM_EDITOR[item.klass].includes('catch') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('catch')}>
      {item.klass === 'BallItem' && (
        <InputContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="catch_rate">{t('catch_rate')}</Label>
            <Input
              type="number"
              name="catch_rate"
              value={isNaN(item.catchRate) ? '' : item.catchRate}
              min="0"
              max="255"
              step="0.1"
              onChange={(event) => {
                const newValue = event.target.value == '' ? Number.NaN : Number(event.target.value);
                if (newValue < 0 || newValue > 255) return event.preventDefault();
                refreshUI((item.catchRate = newValue));
              }}
              onBlur={() => refreshUI((item.catchRate = cleanNaNValue(item.catchRate)))}
            />
          </InputWithLeftLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="spritesheet" required>
              {t('spritesheet')}
            </Label>
            <Input
              type="text"
              name="spritesheet"
              value={item.spriteFilename}
              onChange={(event) => refreshUI((item.spriteFilename = event.target.value))}
              placeholder="ball_1"
            />
          </InputWithTopLabelContainer>
          <InputWithColorLabelContainer>
            <Label htmlFor="color">{t('color')}</Label>
            <Input
              type="color"
              name="color"
              value={colorToHex(item.color)}
              onChange={(event) => refreshUI((item.color = hexToColor(event.target.value)))}
            />
          </InputWithColorLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
};
