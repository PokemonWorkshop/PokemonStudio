import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';
import { Label, RadioInput } from '@components/inputs';
import styled from 'styled-components';
import { languages } from '@root/package.json';

const STUDIO_LANGUAGES = Object.keys(languages).filter(
  (lang) => (languages as Record<string, { active: boolean }>)[lang]?.active !== false
) as readonly string[];

const STUDIO_LANGUAGE_NAMES: { [key: string]: string } = Object.fromEntries(
  Object.keys(languages).map((lang) => [lang, (languages as Record<string, { suffix: string }>)[lang].suffix])
);

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
  const { t, i18n } = useTranslation();
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
    <PageTemplate title={t('language')} size="default">
      <PageEditor title={t('language_choice')} editorTitle={t('language')}>
        <LanguageListContainer>
          {STUDIO_LANGUAGES.map((language) => (
            <LanguageContainer key={language} data-checked={isChecked(language)} onClick={() => onChangeUserLanguage(language)}>
              <RadioInput checked={isChecked(language)} onChange={() => onChangeUserLanguage(language)} />
              <Label className="language-label">
                {STUDIO_LANGUAGE_NAMES[language]}
                <span className="language-details">- {t(`${language}`)}</span>
              </Label>
            </LanguageContainer>
          ))}
        </LanguageListContainer>
      </PageEditor>
    </PageTemplate>
  );
};
