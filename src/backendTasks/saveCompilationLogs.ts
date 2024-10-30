import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SaveCompilationLogsInput = {
  projectPath: string;
  logs: string;
};

const formatDate = (date: Date) => {
  const optionsDate: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

  const year = date.getFullYear();
  const formattedDate = date.toLocaleDateString('en-US', optionsDate).replace(/\//g, '');
  const formattedTime = date.toLocaleTimeString('en-US', optionsTime).replace(/:/g, '');

  return `${year}${formattedDate}-${formattedTime}`;
};

const saveCompilationsLogs = async (payload: SaveCompilationLogsInput) => {
  log.info('save-compilation-logs');

  const projectLogsPath = path.join(payload.projectPath, 'logs');
  if (!fs.existsSync(projectLogsPath)) {
    await fsPromise.mkdir(projectLogsPath, { recursive: true });
  }

  const filename = `${formatDate(new Date())}-compilation.log`;
  await fsPromise.writeFile(path.join(projectLogsPath, filename), payload.logs, { encoding: 'utf-8' });
  log.info('save-compilation-logs/success');
  return {};
};

export const registerSaveCompilationLogs = defineBackendServiceFunction('save-compilation-logs', saveCompilationsLogs);
