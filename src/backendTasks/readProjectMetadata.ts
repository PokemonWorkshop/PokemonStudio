import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { StudioProject } from '@modelEntities/project';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type ReadProjectMetadataInput = { path: string };
export type ReadProjectMetadataOutput = { metaData: StudioProject };

const readProjectMetadata = async (payload: ReadProjectMetadataInput): Promise<ReadProjectMetadataOutput> => {
  log.info('read-project-metadata');

  const metaDataJson = fs.readFileSync(path.join(payload.path, 'project.studio'), { encoding: 'utf-8' });
  const metaData: StudioProject = JSON.parse(metaDataJson);
  log.info('read-project-metadata/success', { metaData });
  return { metaData };
};

export const registerReadProjectMetadata = defineBackendServiceFunction('read-project-metadata', readProjectMetadata);
