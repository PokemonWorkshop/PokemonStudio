import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../assets/i18n/en';
import translationES from '../assets/i18n/es';
import translationFR from '../assets/i18n/fr';
import translationIT from '../assets/i18n/it';
// import translationXX from '../assets/i18n/xx';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    fallbackLng: 'en',
    resources: {
      en: translationEN,
      es: translationES,
      fr: translationFR,
      it: translationIT,
      // XX: translationXX,
    },
  });

export default i18n;
