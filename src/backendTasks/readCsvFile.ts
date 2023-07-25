import log from 'electron-log';
import { loadCSV } from '@utils/textManagement';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ReadCsvFileInput = { filePath: string; fileId: number };

const readCsvFile = async (payload: ReadCsvFileInput) => {
  log.info('read-csv-file');
  const text = await loadCSV(payload.filePath);
  log.info('read-csv-file/success');
  return { [payload.fileId]: text };
};

export const registerReadCsvFile = defineBackendServiceFunction('read-csv-file', readCsvFile);
