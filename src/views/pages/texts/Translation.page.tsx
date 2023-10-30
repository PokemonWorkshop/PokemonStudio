/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';

import { useTranslationPage } from '@utils/usePage';
import { TranslateList } from '@components/textmanagement/TranslateList';
import { TranslateTarget } from '@components/textmanagement/TranslateTarget';
import { TranslateAttachedTexts } from '@components/textmanagement/TranslateAttachedTexts';
import { useLocation } from 'react-router-dom';

export type Language = { index: number; value: string };
export const LanguageContext = createContext({
  language: { value: 'en', index: 0 },
  positionLanguage: 1,
  setLanguage: (value: Language) => {},
  setPositionLanguage: (value: number) => {},
});

export const TranslationPage = () => {
  const { allTextsFromFile, languageByIndexFiltered } = useTranslationPage();
  const { state } = useLocation();
  const [language, setLanguage] = useState<Language>({ value: languageByIndexFiltered[0].value, index: languageByIndexFiltered[0].index });
  const [positionLanguage, setPositionLanguage] = useState<number>(state?.position || 1);
  const { t } = useTranslation('text_management');
  const languageExistInFile = allTextsFromFile[0].includes(language.value);

  useEffect(() => {
    if (!allTextsFromFile[positionLanguage]) {
      setPositionLanguage(1);
    }
  }, [allTextsFromFile]);

  useEffect(() => {
    // if language is not in the new file, then we have toset another language
    if (!languageExistInFile) {
      setLanguage({ value: languageByIndexFiltered[0].value, index: languageByIndexFiltered[0].index });
    }

    const targetLanguage: number = allTextsFromFile[0].findIndex((code) => code === language.value);
    if (targetLanguage !== language.index) {
      setLanguage({ value: language.value, index: targetLanguage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, languageExistInFile, allTextsFromFile]);

  return (
    <DataBlockWrapper>
      {languageExistInFile && (
        <LanguageContext.Provider value={{ language, positionLanguage, setLanguage, setPositionLanguage }}>
          <DataBlockWrapper>
            <TranslateAttachedTexts />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <TranslateTarget />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithTitleNoActive size="full" title={t('other_language')}>
              <TranslateList />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </LanguageContext.Provider>
      )}
    </DataBlockWrapper>
  );
};
