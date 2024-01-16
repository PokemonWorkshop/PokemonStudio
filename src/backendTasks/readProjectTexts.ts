import type { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import { ProjectText } from '@src/GlobalStateProvider';
import { checkTextFileReserved, getTextFileList, getTextPath, loadCSV } from '@utils/textManagement';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';

export type ReadProjectTextInput = { path: string };

const readProjectTexts = async (payload: ReadProjectTextInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('read-project-texts');

  const textFileList = getTextFileList(payload.path, true);
  const reservedFileUsed = await checkTextFileReserved(textFileList, payload.path);
  if (reservedFileUsed) {
    throw 'A reserved text file has been found in Data/Text/Dialogs. The range 200.000 to 299.999 is reserved for the application and must not be used.';
  }

  const projectTexts = await textFileList.reduce(async (prev, curr, index) => {
    const previousResult = await prev;
    sendProgress(event, channels, { step: index + 1, total: textFileList.length, stepText: `${curr}.csv` });
    const currentText = await loadCSV(path.join(payload.path, getTextPath(curr), `${curr}.csv`));
    return { ...previousResult, [curr]: currentText };
  }, Promise.resolve({} as ProjectText));

  log.info('read-project-texts/success');
  return projectTexts as unknown as Record<string, string>;
};

export const registerReadProjectTexts = defineBackendServiceFunction('read-project-texts', readProjectTexts);
