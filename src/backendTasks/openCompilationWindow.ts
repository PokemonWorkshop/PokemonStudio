import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import WindowManager from './windowManager';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const openCompilationWindow = async () => {
  log.info('open-compilation-window');
  WindowManager.createWindow({
    name: 'compilation',
    show: true,
    url: MAIN_WINDOW_WEBPACK_ENTRY,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      //additionalArguments: ['compilation'],
    },
  });
  return {};
};

export const registerOpenCompilationWindow = defineBackendServiceFunction('open-compilation-window', openCompilationWindow);
