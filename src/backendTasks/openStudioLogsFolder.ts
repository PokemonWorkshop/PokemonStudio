import log from 'electron-log';
import { app, shell } from 'electron';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

const getLogsPath = () => {
  if (process.platform === 'win32') {
    return `${app.getPath('userData')}\\logs\\renderer.log`;
  } else if (process.platform === 'linux') {
    return `~/.config/${app.name}/logs/renderer.log`;
  } else {
    return `~/Library/Logs/${app.name}/renderer.log`;
  }
};

const openStudioLogsFolder = async () => {
  log.info('open-studio-logs-folder');

  shell.showItemInFolder(getLogsPath());
  log.info('open-studio-logs-folder/success');
  return {};
};

export const registerOpenStudioLogsFolder = defineBackendServiceFunction('open-studio-logs-folder', openStudioLogsFolder);
