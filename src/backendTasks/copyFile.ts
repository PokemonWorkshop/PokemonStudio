import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ShowMessageBoxTranslation = {
  title: string;
  message: string;
};
export type CopyFileInput = { srcFile: string; destFile: string; translation: ShowMessageBoxTranslation };

const copyFile = async (payload: CopyFileInput) => {
  log.info('copy-file');
  const result = fs.existsSync(payload.srcFile);
  if (!result) throw 'The source file does not exist.';

  if (fs.existsSync(payload.destFile)) {
    const choice = await dialog.showMessageBox(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      type: 'warning',
      buttons: ['Yes', 'No'],
      title: payload.translation.title,
      message: payload.translation.message,
      cancelId: 99,
    });

    if (choice.response === 1) throw 'Pressed no';
    if (choice.response === 99) throw 'Pressed cancel';
  }

  fs.copyFileSync(payload.srcFile, payload.destFile);
  log.info('copy-file/success', { ...payload });
  return {};
};

export const registerCopyFile = defineBackendServiceFunction('copy-file', copyFile);
