import log from 'electron-log';
import i18n from '@src/i18n';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SynchronizeLanguageInput = { language: string };

const synchronizeLanguage = async (payload: SynchronizeLanguageInput) => {
  log.info('synchronize-language', payload.language);
  i18n.changeLanguage(payload.language);
  return {};
};

export const registerSynchronizeLanguage = defineBackendServiceFunction('synchronize-language', synchronizeLanguage);
