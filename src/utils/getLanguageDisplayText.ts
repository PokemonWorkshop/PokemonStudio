export const getLanguageDisplayText = (languageKey: string, t: any, i18n: any, prefix?: string) => {
  const languageTextKey = `text_management:language_${languageKey.toLowerCase()}`;
  if (i18n.exists(languageTextKey)) {
    return t(languageTextKey);
  } else {
    return t('language_default', { prefix: prefix ? prefix : languageKey });
  }
};
