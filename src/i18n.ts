import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { languages } from '../package.json';

import En from '../assets/i18n/en.json';
type TranslationSchema = typeof En;

/**
 * Extracts the active languages from the `languages` object.
 *
 * This function filters the entries of the `languages` object to include only
 * those where the language is marked as active (`isActive` is `true`). It then
 * maps the filtered entries to an array of language codes.
 *
 * @returns An array of language codes representing the active languages.
 */
const activeLanguages = Object.entries(languages)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .filter(([_, isActive]) => isActive)
  .map(([lang]) => lang);

const context = import.meta.glob<{ default: TranslationSchema }>('../assets/i18n/*.json', { eager: true });

const resources: Record<string, { translation: Record<string, string> }> = {};

Object.keys(context).forEach((key) => {
  const match = key.match(/\/([a-z]{2})\.json$/);
  if (!match) return;

  const lang = match[1];

  if (!activeLanguages.includes(lang)) return;

  const translation = context[key].default;
  resources[lang] = { translation: translation as TranslationSchema };
});

/**
 * Configuration options for internationalization (i18n) initialization.
 *
 * @property {object} interpolation - Configuration for string interpolation.
 * @property {boolean} interpolation.escapeValue - Determines whether to escape values to prevent XSS attacks. Defaults to false.
 * @property {string} fallbackLng - The default language to fall back to if the current language is not available. Defaults to 'en'.
 * @property {boolean} returnObjects - Allows returning objects from translation functions. Defaults to true.
 * @property {object} resources - The translation resources containing language keys and their respective translations.
 * @property {boolean} saveMissing - Enables saving missing translation keys to a backend or log.
 * @property {function} missingKeyHandler - A custom handler function that is called when a translation key is missing.
 *                                Logs an error message with the missing key, language, and namespace.
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
