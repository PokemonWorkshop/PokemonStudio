import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { StudioTextInfo, TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { stringify } from 'csv-stringify/sync';
import { findFirstAvailableTextId } from '@utils/ModelUtils';
import { getTextFileList, loadCSV } from '@utils/textManagement';
import { UseDefaultTextInfoTranslationReturnType } from '@utils/useDefaultTextInfoTranslation';

type DefaultTextInfo = {
  names: string[];
  descriptions: string[];
};

type StudioTextInfoWithText = {
  textInfo: StudioTextInfo;
} & DefaultTextInfo;

const STUDIO_CSV_PATH = 'Data/Text/Studio';
const TEXT_INFOS_PATH = 'Data/Studio/text_info.json';

const getTextInfosWithText = (
  fileId: number,
  textId: number,
  textInfoTranslation: UseDefaultTextInfoTranslationReturnType
): StudioTextInfoWithText => {
  const genericDefaultTextInfo = textInfoTranslation.textInfoGenerics.map(({ generic }) => generic);
  const defaultTextInfoTranslation = textInfoTranslation.textInfoTranslations.find(({ textId }) => textId === fileId);
  const names = defaultTextInfoTranslation ? defaultTextInfoTranslation.names : genericDefaultTextInfo.map((text) => `${text}${fileId}`);
  const descriptions = defaultTextInfoTranslation ? defaultTextInfoTranslation.descriptions : genericDefaultTextInfo.map(() => '');
  return {
    textInfo: {
      klass: 'TextInfo',
      fileId,
      textId,
    },
    names,
    descriptions,
  };
};

const mustTextInfosBeUpdated = (projectPath: string) => {
  const textFileList = getTextFileList(projectPath);
  const textInfosFile: StudioTextInfo[] = JSON.parse(
    fs.readFileSync(path.join(projectPath, 'Data', 'Studio', 'text_info.json'), { encoding: 'utf-8' })
  );
  if (textFileList.length !== textInfosFile.length) return true;
  textFileList.sort((a, b) => a - b);
  textInfosFile.sort((a, b) => a.fileId - b.fileId);
  return !textFileList.every((fileId, index) => textInfosFile[index].fileId === fileId);
};

const saveCSV = (projectPath: string, fileId: number, texts: string[][], languages?: string[]) => {
  const csvPath = path.join(projectPath, 'Data', 'Text', 'Studio', `${fileId}.csv`);
  if (languages) texts.unshift(languages);
  fs.writeFileSync(csvPath, stringify(texts));
};

export const updateTextInfos = async (
  event: IpcMainEvent,
  payload: { projectPath: string; currentLanguage: string; textInfoTranslation: UseDefaultTextInfoTranslationReturnType }
) => {
  log.info('update-text-infos', { projectPath: payload.projectPath, currentLanguage: payload.currentLanguage });
  const textInfosFilePath = path.join(payload.projectPath, TEXT_INFOS_PATH);
  const studioTextPath = path.join(payload.projectPath, STUDIO_CSV_PATH);
  const languages = payload.textInfoTranslation.textInfoGenerics.map(({ lang }) => lang);
  try {
    // create the folder Data/Text/Studio if doesn't exist
    if (!fs.existsSync(studioTextPath)) {
      fs.mkdirSync(studioTextPath);
    }
    if (fs.existsSync(textInfosFilePath)) {
      // check if text_infos file and csv files should be updated
      if (!mustTextInfosBeUpdated(payload.projectPath)) {
        log.info('update-text-infos/success', 'nothing to update');
        return event.sender.send('update-text-infos/success', {});
      }
      const textFileList = getTextFileList(payload.projectPath);
      // load text infos data and csv data
      const textInfos: StudioTextInfo[] = JSON.parse(fs.readFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), { encoding: 'utf-8' }));
      const names = await loadCSV(path.join(payload.projectPath, STUDIO_CSV_PATH, TEXT_INFO_NAME_TEXT_ID.toString()));
      const descriptions = await loadCSV(path.join(payload.projectPath, STUDIO_CSV_PATH, TEXT_INFO_DESCRIPTION_TEXT_ID.toString()));
      // clean the text infos data to free unused textId
      const textInfosCleared = textInfos.filter((textInfo) => textFileList.includes(textInfo.fileId)).sort((a, b) => a.textId - b.textId);
      const textInfosUpdated = textFileList.map((fileId) => {
        const textInfo = textInfosCleared.find((textInfo) => textInfo.fileId === fileId);
        if (textInfo) return textInfo;

        const newTextInfoWithText = getTextInfosWithText(fileId, findFirstAvailableTextId(textInfosCleared), payload.textInfoTranslation);
        const { names: newNames, descriptions: newDescriptions, ...newTextInfo } = newTextInfoWithText;
        // add the new text info in text infos
        textInfosCleared.push(newTextInfo.textInfo);
        textInfosCleared.sort((a, b) => a.textId - b.textId);
        // update csv data
        const textId = newTextInfo.textInfo.textId + 1;
        textId >= names.length ? names.push(newNames) : (names[textId] = newNames);
        textId >= descriptions.length ? descriptions.push(newDescriptions) : (descriptions[textId] = newDescriptions);
        return newTextInfo.textInfo;
      });
      saveCSV(payload.projectPath, 200000, names);
      saveCSV(payload.projectPath, 200001, descriptions);
      fs.writeFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), JSON.stringify(textInfosUpdated, null, 2));
      log.info('update-text-infos/success', 'updated file');
      event.sender.send('update-text-infos/success', {});
    } else {
      // text_infos file doesn't exist, so we create and the csv files associated
      const textInfosWithText = getTextFileList(payload.projectPath).map((fileId, index) => {
        return getTextInfosWithText(fileId, index, payload.textInfoTranslation);
      });
      const names = textInfosWithText.map((textInfo) => textInfo.names);
      const descriptions = textInfosWithText.map((textInfo) => textInfo.descriptions);
      const textInfos = textInfosWithText.map((textInfoWithText) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { names: _, descriptions: __, ...textInfo } = textInfoWithText;
        return { fileId: textInfo.textInfo.fileId, textId: textInfo.textInfo.textId, klass: textInfo.textInfo.klass };
      });
      fs.writeFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), JSON.stringify(textInfos, null, 2));
      saveCSV(payload.projectPath, 200000, names, languages);
      saveCSV(payload.projectPath, 200001, descriptions, languages);
      log.info('update-text-infos/success', 'file created');
      event.sender.send('update-text-infos/success', {});
    }
  } catch (error) {
    log.error('update-text-infos/failure', error);
    event.sender.send('update-text-infos/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerUpdateTextInfos = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('update-text-infos', updateTextInfos);
};
