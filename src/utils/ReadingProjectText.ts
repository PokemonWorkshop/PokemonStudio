import { State, ProjectText, projectTextKeys, projectTextSave, TextsWithLanguageConfig } from '@src/GlobalStateProvider';

type KeyProjectText = keyof ProjectText;

const CSV_BASE = 100_000;

const getLanguage = (fileText: string[][], defaultLanguage: string) => {
  const language = fileText[0].indexOf(defaultLanguage || 'en');
  return language == -1 ? 0 : language;
};

/**
 * Get a dialog message
 * @param projectText The text of the project
 * @param fileId id of the dialog file
 * @param textId id of the dialog message in the file (0 = 2nd line of csv, 1 = 3rd line of csv)
 * @return the text
 */
export const getDialogMessage = (projectText: TextsWithLanguageConfig, fileId: number, textId: number) => {
  const fileText = projectText.texts[fileId as KeyProjectText];
  if (!fileText) return `Unable to find dialog file ${fileId}.`;
  const dialog = fileText[textId + 1];
  if (!dialog) return `Unable to find text ${textId} in dialog file ${fileId}.`;
  return dialog[getLanguage(fileText, projectText.config.defaultLanguage)];
};

/**
 * Get a text front the text database
 * @param projectText The text of the project
 * @param fileId ID of the text file
 * @param textId ID of the text in the file
 * @returns the text
 */
export const getText = (projectText: TextsWithLanguageConfig, fileId: number, textId: number) => {
  return getDialogMessage(projectText, CSV_BASE + fileId, textId);
};

export const getNatureText = (state: State, natureDbSymbol: string) => {
  return getText(
    { texts: state.projectText, config: state.projectConfig.language_config },
    8,
    (state.projectConfig.natures.data[state.projectConfig.natures.db_symbol_to_id[natureDbSymbol] || 0] || [0])[0]
  );
};

/**
 * Set a dialog message
 * @param projectText The text of the project
 * @param fileId id of the dialog file
 * @param textId id of the dialog message in the file (0 = 2nd line of csv, 1 = 3rd line of csv)
 * @param text text to set
 */
export const setDialogMessage = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, text: string) => {
  projectTextSave[projectTextKeys.indexOf(fileId as KeyProjectText)] = true;
  const fileText = projectText.texts[fileId as KeyProjectText];
  if (!fileText) return;

  if (!fileText[textId + 1]) fileText[textId + 1] = new Array(fileText[0].length);
  const dialog = fileText[textId + 1];

  dialog[getLanguage(fileText, projectText.config.defaultLanguage)] = text;
};

/**
 * Get a text front the text database
 * @param projectText The text of the project
 * @param fileId ID of the text file
 * @param textId ID of the text in the file
 * @param text text to set
 */
export const setText = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, text: string) => {
  return setDialogMessage(projectText, CSV_BASE + fileId, textId, text);
};
