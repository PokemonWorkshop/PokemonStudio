import { net } from 'electron';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type RequestFileInput = { url: string };
export type RequestFileOutput = { file: unknown };

export const requestFile = async (url: string) => {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    let data = '';
    request.on('response', (response) => {
      response.on('end', async () => {
        try {
          resolve(JSON.parse(data.trim()));
        } catch (error) {
          reject(error);
        }
      });
      response.on('data', (chunk) => {
        data = data + chunk.toString('utf-8');
      });
    });
    request.on('error', (error) => reject(error));
    request.end();
  });
};

export const requestFileService = async (payload: RequestFileInput) => {
  log.info('request-file', payload);
  const file = await requestFile(payload.url);
  log.info('request-file/success', file);
  return { file } as RequestFileOutput;
};

export const registerRequestFile = defineBackendServiceFunction('request-file', requestFileService);
