import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import En from '../assets/i18n/en.json';
type TranslationSchema = typeof En;

/**
 * A custom declaration for the `require` function with a `context` method.
 * This is typically used in environments like Webpack to dynamically load modules
 * based on a specified path, depth, and optional filter.
 *
 * @property context - A method to create a context for dynamically requiring modules.
 * @param path - The base directory to search for modules.
 * @param deep - Optional. If `true`, searches subdirectories recursively. Defaults to `false`.
 * @param filter - Optional. A regular expression to filter the files to include.
 * @returns An object with the following properties:
 *   - `keys`: A function that returns an array of all matched module paths as strings.
 *   - `<T>(id: string): T`: A function to require a module by its path and return it as type `T`.
 */
declare const require: {
  context: (
    path: string,
    deep?: boolean,
    filter?: RegExp
  ) => {
    keys: () => string[];
    <T>(id: string): T;
  };
};

const context = require.context('../assets/i18n', false, /\.json$/);

const resources: Record<string, { translation: Record<string, string> }> = {};

context.keys().forEach((key) => {
  const match = key.match(/\.\/([a-z]{2})\.json$/);
  if (!match) return;

  const lang = match[1];
  const translation = context(key);
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
