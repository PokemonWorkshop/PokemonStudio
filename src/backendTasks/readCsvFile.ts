import { IpcMainEvent } from 'electron';
import { loadCSV } from '@utils/textManagement';
import { ProjectText } from '@src/GlobalStateProvider';

const readCsvFile = async (event: IpcMainEvent, payload: { filePath: string; fileId: number }) => {
  console.info('read-csv-file');
  try {
    const text = await loadCSV(payload.filePath);
    console.info('read-csv-file/success');
    event.sender.send('read-csv-file/success', { [payload.fileId]: text } as ProjectText);
  } catch (error) {
    console.error('read-csv-file/failure', error);
    event.sender.send('read-csv-file/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadCsvFile = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('read-csv-file', readCsvFile);
};
