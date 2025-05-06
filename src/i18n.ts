import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import En from '../assets/i18n/en.json';
import Fr from '../assets/i18n/fr.json';
import Es from '../assets/i18n/es.json';
import It from '../assets/i18n/it.json';
import Pt from '../assets/i18n/pt.json';
import De from '../assets/i18n/de.json';

type Languages = 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de';

/**
 * Represents the translation resources for different languages.
 *
 * @typedef {Object} TranslationResources
 * @property {Object} [key in Languages] - An object containing translation data for a specific language.
 * @property {typeof En} [key in Languages].translation - The translation template for the language.
 */
type TranslationResources = {
  [key in Languages]: {
    translation: typeof En; //Uses ‘en.json’ as the absolute value for the list of keys
  };
};

/**
 * The resources object contains the language translations for all available languages.
 * In this case, translations for all supported languages are provided.
 * @type {TranslationResources}
 */
const resources: TranslationResources = {
  en: {
    translation: En,
  },
  fr: {
    translation: Fr,
  },
  es: {
    translation: Es,
  },
  it: {
    translation: It,
  },
  pt: {
    translation: Pt,
  },
  de: {
    translation: De,
  },
};

/**
 * Configuration options for internationalization (i18n) initialization.
 *
 * @property {object} interpolation - Configuration for string interpolation.
 * @property {boolean} interpolation.escapeValue - Determines whether to escape values to prevent XSS attacks. Defaults to false.
 * @property {string} fallbackLng - The default language to fall back to if the current language is not available. Defaults to 'en'.
 * @property {boolean} returnObjects - Allows returning objects from translation functions. Defaults to true.
 * @property {object} resources - The translation resources containing language keys and their respective translations.
 */
const i18nOptions: InitOptions = {
  interpolation: {
    escapeValue: false,
  },
  fallbackLng: 'en',
  returnObjects: true,
  resources,
  saveMissing: true,
  missingKeyHandler: (lng, ns, key) => {
    console.error(`[i18n] Missing translation key "${key}" for language "${lng}" in namespace "${ns}"`);
  },
};

// eslint-disable-next-line import/no-named-as-default-member
i18next.use(LanguageDetector).use(initReactI18next).init(i18nOptions);

export default i18next;
