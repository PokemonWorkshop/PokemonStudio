import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';
import { Label, RadioInput } from '@components/inputs';
import styled from 'styled-components';

const STUDIO_LANGUAGES = ['de', 'es', 'en', 'fr', 'it', 'pt'] as const;
const STUDIO_LANGUAGE_NAMES = {
  en: 'English, US',
  fr: 'Français, FR',
  es: 'Español',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português',
};

const LanguageListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  user-select: none;
`;

const LanguageContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  padding: 4px 4px 4px 8px;
  border-radius: 8px;
  height: 40px;

  :hover,
  *:hover {
    background-color: ${({ theme }) => theme.colors.dark19};
    cursor: pointer;
  }

  &[data-checked='true'] {
    background-color: ${({ theme }) => theme.colors.dark19};

    .language-label {
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  .language-label,
  .language-details {
    color: ${({ theme }) => theme.colors.text400};
  }
`;

export const SettingsLanguagePage = () => {
  const { t, i18n } = useTranslation(['settings', 'settings_language']);
  const [userLanguage, setUserLanguage] = useState<string>(i18n.language);

  const isChecked = (language: string) => {
    if (!(STUDIO_LANGUAGES as readonly string[]).includes(userLanguage) && language === 'en') return true;

    return language === userLanguage;
  };

  const onChangeUserLanguage = (language: string) => {
    setUserLanguage(language);
    i18n.changeLanguage(language);
    window.api.synchronizeLanguage(
      { language },
      () => {},
      () => {}
    );
  };

  return (
    <PageTemplate title={t('settings:language')} size="default">
      <PageEditor title={t('settings_language:language_choice')} editorTitle={t('settings:language')}>
        <LanguageListContainer>
          {STUDIO_LANGUAGES.map((language) => (
            <LanguageContainer key={language} data-checked={isChecked(language)} onClick={() => onChangeUserLanguage(language)}>
              <RadioInput checked={isChecked(language)} onChange={() => onChangeUserLanguage(language)} />
              <Label className="language-label">
                {STUDIO_LANGUAGE_NAMES[language]}
                <span className="language-details">- {t(`settings_language:${language}`)}</span>
              </Label>
            </LanguageContainer>
          ))}
        </LanguageListContainer>
      </PageEditor>
    </PageTemplate>
  );
};
