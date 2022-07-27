import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import DexModel from '@modelEntities/dex/Dex.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

type DexFrameEditorProps = {
  dex: DexModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const DexFrameEditor = ({ dex, openTranslationEditor }: DexFrameEditorProps) => {
  const { t } = useTranslation('database_dex');
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('dex_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={dex.name()}
              onChange={(event) => refreshUI(dex.setName(event.target.value))}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="first-number">{t('first_number')}</Label>
          <Input
            type="number"
            name="first-number"
            min="0"
            max="999"
            value={isNaN(dex.startId) ? '' : dex.startId}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 999) return event.preventDefault();
              refreshUI((dex.startId = newValue));
            }}
            onBlur={() => refreshUI((dex.startId = cleanNaNValue(dex.startId)))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
