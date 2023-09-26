import { shell } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import path from 'path';

export type ShowItemInFolderInput = { filePath: string; extensions?: string[] };

const showItemInFolder = async (payload: ShowItemInFolderInput) => {
  log.info('show-item-folder', payload);
  if (payload.extensions && path.extname(payload.filePath) === '') {
    const isOpen = { value: false };
    payload.extensions.forEach((ext) => {
      const extension = ext.startsWith('.') ? ext : `.${ext}`;
      const filepathWithExt = `${process.platform === 'win32' ? payload.filePath.replaceAll('/', '\\') : payload.filePath}${extension}`;
      if (!isOpen.value && fs.existsSync(filepathWithExt)) {
        shell.showItemInFolder(filepathWithExt);
        isOpen.value = true;
      }
    });
  } else {
    if (process.platform === 'win32') shell.showItemInFolder(payload.filePath.replaceAll('/', '\\'));
    else shell.showItemInFolder(payload.filePath);
  }

  log.info('show-item-folder/success');
  return {};
};

export const registerShowItemInFolder = defineBackendServiceFunction('show-item-folder', showItemInFolder);
