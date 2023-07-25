import type { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import { ProjectText } from '@src/GlobalStateProvider';
import { getTextFileList, loadCSV } from '@utils/textManagement';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { ChannelNames, sendProgress } from '@utils/BackendTask';

export type ReadProjectTextInput = { path: string };

const readProjectTexts = async (payload: ReadProjectTextInput, event: IpcMainEvent, channels: ChannelNames) => {
  log.info('read-project-texts');

  const textFileList = getTextFileList(payload.path, true);
  const projectTexts = await textFileList.reduce(async (prev, curr, index) => {
    const previousResult = await prev;
    sendProgress(event, channels, { step: index + 1, total: textFileList.length, stepText: `${curr}.csv` });
    const currentText = await loadCSV(path.join(payload.path, curr >= 200000 ? `Data/Text/Studio/${curr}` : `Data/Text/Dialogs/${curr}`));
    return { ...previousResult, [curr]: currentText };
  }, Promise.resolve({} as ProjectText));

  log.info('read-project-texts/success');
  return projectTexts as unknown as Record<string, string>;
};

export const registerReadProjectTexts = defineBackendServiceFunction('read-project-texts', readProjectTexts);
