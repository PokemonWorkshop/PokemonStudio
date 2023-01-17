import log from 'electron-log';
import Electron, { app, IpcMainEvent, shell } from 'electron';

const getLogsPath = () => {
  if (process.platform === 'win32') {
    return `${app.getPath('userData')}\\logs\\renderer.log`;
  } else if (process.platform === 'linux') {
    return `~/.config/${app.name}/logs/renderer.log`;
  } else {
    return `~/Library/Logs/${app.name}/renderer.log`;
  }
};

const openStudioLogsFolder = (event: IpcMainEvent) => {
  log.info('open-studio-logs-folder');
  try {
    shell.showItemInFolder(getLogsPath());
    log.info('open-studio-logs-folder/success');
    event.sender.send('open-studio-logs-folder/success', {});
  } catch (error) {
    log.error('open-studio-logs-folder/failure', error);
    event.sender.send('open-studio-logs-folder/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerOpenStudioLogsFolder = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('open-studio-logs-folder', openStudioLogsFolder);
};
