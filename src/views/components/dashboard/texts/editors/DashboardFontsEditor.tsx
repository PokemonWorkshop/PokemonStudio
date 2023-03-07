import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { StudioTextConfig, StudioTextTtfFileConfig } from '@modelEntities/config';

type DashbordFontsEditorProps = {
  texts: StudioTextConfig;
  index: number;
  isAlternative: boolean;
};

export const DashboardFontsEditor = ({ texts, index, isAlternative }: DashbordFontsEditorProps) => {
  const ttfFileOrAltSize = isAlternative ? texts.fonts.altSizes[index] : texts.fonts.ttfFiles[index];
  const { t } = useTranslation('dashboard_texts');
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={isAlternative ? t('alt_sizes') : t('fonts')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="id">ID</Label>
          <Input
            name="id"
            type="number"
            value={isNaN(ttfFileOrAltSize.id) ? '' : ttfFileOrAltSize.id}
            onChange={(event) => refreshUI((ttfFileOrAltSize.id = parseInt(event.target.value)))}
            onBlur={() => refreshUI((ttfFileOrAltSize.id = isNaN(ttfFileOrAltSize.id) ? 0 : ttfFileOrAltSize.id))}
          />
        </InputWithLeftLabelContainer>
        {!isAlternative && (
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('font_name')}
            </Label>
            <Input
              type="text"
              value={(ttfFileOrAltSize as StudioTextTtfFileConfig).name}
              onChange={(event) => refreshUI(((ttfFileOrAltSize as StudioTextTtfFileConfig).name = event.target.value))}
              placeholder="PokemonDS"
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="size">{t('size')}</Label>
          <Input
            name="size"
            type="number"
            value={isNaN(ttfFileOrAltSize.size) ? '' : ttfFileOrAltSize.size}
            onChange={(event) => refreshUI((ttfFileOrAltSize.size = parseInt(event.target.value)))}
            onBlur={() => refreshUI((ttfFileOrAltSize.size = isNaN(ttfFileOrAltSize.size) ? 0 : ttfFileOrAltSize.size))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="line-height">{t('line_height')}</Label>
          <Input
            name="line-height"
            type="number"
            value={isNaN(ttfFileOrAltSize.lineHeight) ? '' : ttfFileOrAltSize.lineHeight}
            onChange={(event) => refreshUI((ttfFileOrAltSize.lineHeight = parseInt(event.target.value)))}
            onBlur={() => refreshUI((ttfFileOrAltSize.lineHeight = isNaN(ttfFileOrAltSize.lineHeight) ? 0 : ttfFileOrAltSize.lineHeight))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
