import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import { useTranslation } from 'react-i18next';
import {
  Input,
  InputContainer,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import { TypeCategoryPreview } from '@components/categories';
import { TypeFrameProps } from '../TypeDataPropsInterface';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';

export const TypeFrameEditor = ({ type, openTranslationEditor }: TypeFrameProps & { openTranslationEditor: OpenTranslationEditorFunction }) => {
  const { t } = useTranslation(['database_types', 'database_moves']);
  const getTypeName = useGetEntityNameTextUsingTextId();
  const setText = useSetProjectText();
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_types:informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={getTypeName(type)}
              onChange={(event) => setText(TYPE_NAME_TEXT_ID, type.textId, event.target.value)}
              placeholder={t('database_types:example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithColorLabelContainer>
          <Label htmlFor="color">{t('database_types:color')}</Label>
          <Input type="color" name="color" value={type.color || '#C3B5B2'} onChange={(event) => refreshUI((type.color = event.target.value))} />
        </InputWithColorLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="preview">{t('database_types:preview')}</Label>
          <TypeCategoryPreview type={type.color || type.dbSymbol}>{getTypeName(type) || '???'}</TypeCategoryPreview>
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
