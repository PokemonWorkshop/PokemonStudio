import log from 'electron-log';
import { app, shell } from 'electron';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import path from 'path';

const getLogsPath = () => {
  try {
    // Proper way to get them
    return path.join(app.getPath('logs'), 'renderer.log');
  } catch (error) {
    log.error('Failed to open logs the proper way', error);
    if (process.platform === 'win32') {
      return `${app.getPath('userData')}\\logs\\renderer.log`;
    } else if (process.platform === 'linux') {
      return `~/.config/${app.name}/logs/renderer.log`;
    } else {
      return `${process.env.HOME}/Library/Logs/${app.name}/renderer.log`;
    }
  }
};

const openStudioLogsFolder = async () => {
  log.info('open-studio-logs-folder', 'called');
  shell.showItemInFolder(getLogsPath());
  return {};
};

export const registerOpenStudioLogsFolder = defineBackendServiceFunction('open-studio-logs-folder', openStudioLogsFolder);
