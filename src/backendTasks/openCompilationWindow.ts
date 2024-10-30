import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { compilationConfig } from './getCompilationConfig';
import WindowManager, { mainWindowWebpackEntry } from './windowManager';
import { StudioCompilation } from '@components/compilation/CompilationDialogSchema';

export type OpenCompilationWindowInput = {
  configuration: StudioCompilation;
};

const openCompilationWindow = async (payload: OpenCompilationWindowInput) => {
  log.info('open-compilation-window');

  const compilationWindow = WindowManager.createWindow({
    name: 'compilation',
  });

  await compilationWindow.loadURL(mainWindowWebpackEntry);
  compilationConfig.push(payload.configuration);

  compilationWindow.show();

  return {};
};

export const registerOpenCompilationWindow = defineBackendServiceFunction('open-compilation-window', openCompilationWindow);
