import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { compilationConfig } from './getCompilationConfig';
import WindowManager, { mainWindowViteDevServerUrl, mainWindowViteName } from './windowManager';
import { StudioCompilation } from '@components/compilation/CompilationDialogSchema';
import path from 'path';

export type OpenCompilationWindowInput = {
  configuration: StudioCompilation;
};

const openCompilationWindow = async (payload: OpenCompilationWindowInput) => {
  log.info('open-compilation-window');

  const compilationWindow = WindowManager.createWindow({
    name: 'compilation',
  });

  if (mainWindowViteDevServerUrl) {
    await compilationWindow.loadURL(mainWindowViteDevServerUrl);
  } else {
    await compilationWindow.loadFile(path.join(__dirname, `../renderer/${mainWindowViteName}/index.html`));
  }

  compilationConfig.push(payload.configuration);
  compilationWindow.show();

  return {};
};

export const registerOpenCompilationWindow = defineBackendServiceFunction('open-compilation-window', openCompilationWindow);
