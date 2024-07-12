import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { compilationConfig } from './getCompilationConfig';
import WindowManager from './windowManager';
import { StudioCompilation } from '@components/compilation/CompilationDialogSchema';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export type OpenCompilationWindowInput = {
  configuration: StudioCompilation;
};

const openCompilationWindow = async (payload: OpenCompilationWindowInput) => {
  log.info('open-compilation-window');
  const compilationWindow = WindowManager.createWindow({
    name: 'compilation',
    url: MAIN_WINDOW_WEBPACK_ENTRY,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  compilationWindow
    .loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
    .then(() => {
      compilationConfig.push(payload.configuration);
    })
    .then(() => compilationWindow.show());
  return {};
};

export const registerOpenCompilationWindow = defineBackendServiceFunction('open-compilation-window', openCompilationWindow);
