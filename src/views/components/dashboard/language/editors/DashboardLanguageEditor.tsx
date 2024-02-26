import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorWithPagination, useRefreshUI } from '@components/editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';
import { StudioLanguageConfig } from '@modelEntities/config';

type DashboardLanguageEditorProps = {
  language: StudioLanguageConfig;
  index: number;
};

export const DashboardLanguageEditor = ({ language, index }: DashboardLanguageEditorProps) => {
  const { t } = useTranslation('dashboard_language');
  const [languageIndex, setLanguageIndex] = useState(index);
  const languageCount = language.choosableLanguageCode.length;
  const refreshUI = useRefreshUI();

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      if (languageIndex <= 0) setLanguageIndex(languageCount - 1);
      else setLanguageIndex(languageIndex - 1);
    } else {
      if (languageIndex >= languageCount - 1) setLanguageIndex(0);
      else setLanguageIndex(languageIndex + 1);
    }
  };

  const paginationProps: PaginationWithTitleProps = {
    title: `#${languageIndex + 1} - ${
      language.choosableLanguageTexts[languageIndex] !== '' ? language.choosableLanguageTexts[languageIndex] : '???'
    }`,
    onChangeIndex,
  };

  return (
    <EditorWithPagination type="edit" title={t('supported_languages')} paginationProps={paginationProps}>
      <EditorChildWithSubEditorContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="language-text" required>
              {t('language')}
            </Label>
            <Input
              type="text"
              name="language-text"
              value={language.choosableLanguageTexts[languageIndex]}
              onChange={(event) => refreshUI((language.choosableLanguageTexts[languageIndex] = event.target.value))}
              placeholder={t('placeholder_language')}
            />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
};
