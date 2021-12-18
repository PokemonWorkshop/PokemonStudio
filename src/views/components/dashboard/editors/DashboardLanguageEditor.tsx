import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { EditorWithPagination, useRefreshUI } from '@components/editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import LanguageConfigModel from '@modelEntities/config/LanguageConfig.model';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';

const CodeInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const CodeErrorContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.dangerBase};
`;

type DashboardLanguageEditorProps = {
  language: LanguageConfigModel;
  index: number;
};

export const DashboardLanguageEditor = ({ language, index }: DashboardLanguageEditorProps) => {
  const { t } = useTranslation('dashboard_language');
  const [languageIndex, setLanguageIndex] = useState(index);
  const languageCount = language.choosableLanguageCode.length;
  const refreshUI = useRefreshUI();

  const isCodeUnique = () =>
    language.choosableLanguageCode.find(
      (code, codeIndex) => code === language.choosableLanguageCode[languageIndex] && codeIndex !== languageIndex
    ) === undefined;

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      if (languageIndex <= 0) setLanguageIndex(languageCount - 1);
      else setLanguageIndex(languageIndex - 1);
    } else {
      if (languageIndex >= languageCount - 1) setLanguageIndex(0);
      else setLanguageIndex(languageIndex + 1);
    }
  };

  const onChangePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = event.target.value.toLocaleLowerCase();
    if (prefix.length >= 5) return event.preventDefault();

    language.choosableLanguageCode[languageIndex] = prefix;
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
          <InputWithTopLabelContainer>
            <Label htmlFor="language-prefix" required>
              {t('prefix')}
            </Label>
            <Input
              type="text"
              name="language-prefix"
              value={language.choosableLanguageCode[languageIndex]}
              onChange={(event) => refreshUI(onChangePrefix(event))}
              error={!isCodeUnique()}
              placeholder={t('placeholder_prefix')}
            />
            {!isCodeUnique() && <CodeErrorContainer>{t('code_error')}</CodeErrorContainer>}
            <CodeInfoContainer>{t('code_info')}</CodeInfoContainer>
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
};
