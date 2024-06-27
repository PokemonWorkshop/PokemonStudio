import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import WindowManager from './windowManager';

const openCompilationWindow = async () => {
  log.info('open-compilation-window');
  WindowManager.createWindow({ name: 'compilation', show: true });
  return {};
};

export const registerOpenCompilationWindow = defineBackendServiceFunction('open-compilation-window', openCompilationWindow);
