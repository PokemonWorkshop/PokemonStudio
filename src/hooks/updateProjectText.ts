import { State } from '@src/GlobalStateProvider';

/** Warning: Duplication with ReadingProjectText */
const getLanguage = (fileText: string[][], defaultLanguage: string) => {
  const language = fileText[0].indexOf(defaultLanguage || 'en');
  return language == -1 ? 0 : language;
};

const addText = (fileId: number, fileText: string[][], text: string, realIndex: number) => {
  const defaultLine = new Array(fileText[0].length).fill('NewText');
  // we create as many lines as necessary to reach the desired index
  if (realIndex > fileText.length) {
    const repeat = realIndex - fileText.length + 1;
    const newLines = Array.from({ length: repeat }, () => [...defaultLine]);
    newLines[newLines.length - 1] = new Array(fileText[0].length).fill(text);
    return [fileId, [...fileText, ...newLines]] as const;
  }
  return [fileId, [...fileText.slice(0, realIndex), new Array(fileText[0].length).fill(text), ...fileText.slice(realIndex + 1)]] as const;
};

export type TextUpdate = {
  textIndex: number;
  texts: Record<number, string>;
};

export const getProjectTextChange = (language: string, textIndex: number, fileId: number, text: string, projectText: State['projectText']) => {
  const fileText = projectText[fileId];
  if (!fileText) throw new Error(`Cannot update text file ${fileId} if it's not in the GlobalState`);

  const realIndex = textIndex + 1; // Locales are the header
  const currentTextLine = fileText[realIndex];

  if (!currentTextLine) {
    return addText(fileId, fileText, text, realIndex);
  } else {
    const localeIndex = getLanguage(fileText, language);
    if (currentTextLine[localeIndex] === text) return [fileId, fileText] as const;

    return [
      fileId,
      [
        ...fileText.slice(0, realIndex),
        [...currentTextLine.slice(0, localeIndex), text, ...currentTextLine.slice(localeIndex + 1)],
        ...fileText.slice(realIndex + 1),
      ],
    ] as const;
  }
};

export const buildTextUpdate = (
  { textIndex, texts }: TextUpdate,
  { projectText, projectConfig }: Pick<State, 'projectText' | 'projectConfig'>
): { fileIdUpdatedTexts: number[]; projectText: State['projectText'] } => {
  const language = projectConfig.language_config.defaultLanguage;
  const fileIdUpdatedTexts: number[] = [];
  const updatedTexts = Object.entries(texts).map(([baseFileId, text]) => {
    fileIdUpdatedTexts.push(Number(baseFileId));
    return getProjectTextChange(language, textIndex, Number(baseFileId), text, projectText);
  });
  return {
    fileIdUpdatedTexts,
    projectText: {
      ...projectText,
      ...Object.fromEntries(updatedTexts),
    },
  };
};

export const getProjectMultiLanguageTextChange = (
  languagesWithTexts: (readonly [string, string])[],
  textIndex: number,
  fileId: number,
  projectText: State['projectText']
) => {
  const fileText = projectText[fileId];
  if (!fileText) throw new Error(`Cannot update text file ${fileId} if it's not in the GlobalState`);

  const textToLocaleMapping = languagesWithTexts.map(([locale, text]) => [getLanguage(fileText, locale), text] as const);

  const realIndex = textIndex + 1; // Locales are the header
  const currentTextLine = fileText[realIndex];

  if (!currentTextLine) {
    // This case should never happen but just in case it remains implemented
    const newTextLine = Array.from(
      { length: fileText[0].length },
      (_, index) => textToLocaleMapping.find(([localeIndex]) => localeIndex === index)?.[1] || `[~ ${textIndex}]`
    );
    return [fileId, [...fileText.slice(0, realIndex), newTextLine, ...fileText.slice(realIndex + 1)]] as const;
  } else {
    const updatedTextLine = currentTextLine.map((text, index) => textToLocaleMapping.find(([localeIndex]) => localeIndex === index)?.[1] || text);
    if (currentTextLine.every((currentText, index) => currentText === updatedTextLine[index])) return [fileId, fileText] as const;

    return [fileId, [...fileText.slice(0, realIndex), updatedTextLine, ...fileText.slice(realIndex + 1)]] as const;
  }
};
