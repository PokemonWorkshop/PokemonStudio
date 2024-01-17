import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import axios from 'axios';

export type RequestFileInput = { url: string };
export type RequestFileOutput = { file: unknown };

export const requestFile = async (url: string) => {
  const response = await axios({ method: 'get', url, responseType: 'json' });
  return response.data;
};

export const requestFileService = async (payload: RequestFileInput) => {
  log.info('request-file', payload);
  const file = await requestFile(payload.url);
  log.info('request-file/success', file);
  return { file } as RequestFileOutput;
};

export const registerRequestFile = defineBackendServiceFunction('request-file', requestFileService);
