import { IpcMainEvent } from 'electron';
import path from 'path';
import { ProjectText } from '@src/GlobalStateProvider';
import { getTextFileList, loadCSV } from '@utils/textManagement';

const readProjectTexts = async (event: IpcMainEvent, payload: { path: string }) => {
  console.info('read-project-texts');
  try {
    const textFileList = getTextFileList(payload.path, true);
    const projectTexts = await textFileList.reduce(async (prev, curr, index) => {
      const previousResult = await prev;
      event.sender.send('read-project-texts/progress', { step: index + 1, total: textFileList.length, stepText: `${curr}.csv` });
      const currentText = await loadCSV(path.join(payload.path, curr >= 200000 ? `Data/Text/Studio/${curr}` : `Data/Text/Dialogs/${curr}`));
      return { ...previousResult, [curr]: currentText };
    }, Promise.resolve({} as ProjectText));

    console.info('read-project-texts/success');
    event.sender.send('read-project-texts/success', projectTexts);
  } catch (error) {
    console.error('read-project-texts/failure', error);
    event.sender.send('read-project-texts/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadProjectTexts = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('read-project-texts', readProjectTexts);
};
