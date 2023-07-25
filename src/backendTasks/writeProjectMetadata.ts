import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type WriteProjectMetadataInput = { path: string; metaData: string };

const writeProjectMetadata = async (payload: WriteProjectMetadataInput) => {
  log.info('write-project-metadata');

  fs.writeFileSync(path.join(payload.path, 'project.studio'), payload.metaData);
  log.info('write-project-metadata/success');
  return {};
};

export const registerWriteProjectMetadata = defineBackendServiceFunction('write-project-metadata', writeProjectMetadata);
