import { shell } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ShowItemInFolderInput = { filePath: string; extensions?: string[] };

const showItemInFolder = async (payload: ShowItemInFolderInput) => {
  log.info('show-item-folder');
  if (payload.extensions) {
    const isOpen = { value: false };
    payload.extensions.forEach((ext) => {
      const filepathWithExt = `${process.platform === 'win32' ? payload.filePath.replaceAll('/', '\\') : payload.filePath}${ext}`;
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
