import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';
import { Label } from '@components/inputs';
import i18n from '@src/i18n';
import styled from 'styled-components';

const STUDIO_LANGUAGES = ['en', 'fr', 'es', 'it', 'de', 'pt'] as const;

const InputRadioWithLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;

  input {
    margin: 0;
    padding: 0;
  }
`;

export const SettingsLanguagePage = () => {
  const { t } = useTranslation(['settings', 'settings_language']);
  const [userLanguage, setUserLanguage] = useState<string>(i18n.language);

  const isChecked = (language: string) => {
    if (!(STUDIO_LANGUAGES as readonly string[]).includes(userLanguage) && language === 'en') return true;

    return language === userLanguage;
  };

  const onChangeUserLanguage = (language: string) => {
    setUserLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <PageTemplate title={t('settings:language')} size="default">
      <PageEditor title={t('settings_language:choice_language')} editorTitle={t('settings:language')}>
        {STUDIO_LANGUAGES.map((language) => (
          <InputRadioWithLabelContainer key={language}>
            <input type="radio" checked={isChecked(language)} onChange={() => onChangeUserLanguage(language)} />
            <Label>{t(`settings_language:${language}`)}</Label>
          </InputRadioWithLabelContainer>
        ))}
      </PageEditor>
    </PageTemplate>
  );
};
