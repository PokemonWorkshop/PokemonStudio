import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type RequestJsonInput = { url: string };
export type RequestJsonOutput = { json: unknown };

export const requestJson = async (url: string) => {
  const response = await fetch(url);
  const status = response.status;
  if (status >= 400) {
    throw new Error(`Error during request to ${url}. Status code: ${status}`);
  }
  const json = await response.json();
  return json;
};

export const requestJsonService = async (payload: RequestJsonInput) => {
  log.info('request-json', payload);
  const json = await requestJson(payload.url);
  log.info('request-json/success', json);
  return { json } as RequestJsonOutput;
};

export const registerRequestJson = defineBackendServiceFunction('request-json', requestJsonService);
