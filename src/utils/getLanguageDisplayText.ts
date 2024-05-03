import type { TFunction, i18n } from 'i18next';

export const getLanguageDisplayText = (languageKey: string, t: TFunction<'text_management'>, i18n: i18n, prefix?: string) => {
  const languageTextKey = `text_management:language_${languageKey.toLowerCase()}`;
  if (i18n.exists(languageTextKey)) {
    return t(languageTextKey);
  } else {
    return t('language_default', { prefix: prefix ? prefix : languageKey });
  }
};

export const getLanguageName = (code: string, defaultName: string, t: TFunction<'text_management'>, i18n: i18n) => {
  const languageTextKey = `text_management:language_${code.toLowerCase()}`;
  if (i18n.exists(languageTextKey)) {
    return t(languageTextKey);
  } else {
    return defaultName;
  }
};
