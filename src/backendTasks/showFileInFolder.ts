import { shell } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import path from 'path';

export type ShowItemInFolderInput = { filePath: string; extensions?: string[] };

const showItemInFolder = async (payload: ShowItemInFolderInput) => {
  log.info('show-item-folder', payload);

  try {
    if (payload.extensions && path.extname(payload.filePath) === '') {
      const isOpen = { value: false };
      for (const ext of payload.extensions) {
        const extension = ext.startsWith('.') ? ext : `.${ext}`;
        const filepathWithExt = `${process.platform === 'win32' ? payload.filePath.replaceAll('/', '\\') : payload.filePath}${extension}`;
        if (!isOpen.value && fs.existsSync(filepathWithExt)) {
          shell.showItemInFolder(filepathWithExt);
          isOpen.value = true;
          break;
        }
      }
      if (!isOpen.value) {
        throw new Error('File not found with any of the provided extensions');
      }
    } else {
      const filePath = process.platform === 'win32' ? payload.filePath.replaceAll('/', '\\') : payload.filePath;
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      shell.showItemInFolder(filePath);
    }

    log.info('show-item-folder/success');
    return { success: true };
  } catch (error) {
    log.error('show-item-folder/error', error);
    throw new Error('File not found with any of the provided extensions');
  }
};

export const registerShowItemInFolder = defineBackendServiceFunction('show-item-folder', showItemInFolder);
