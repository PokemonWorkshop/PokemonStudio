import type { StudioCompilation } from '@components/compilation/CompilationDialogSchema';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import log from 'electron-log';

export type GetCompilationConfigOutput = { configuration?: StudioCompilation };

export const compilationConfig: StudioCompilation[] = [];

const getCompilationConfig = async (): Promise<GetCompilationConfigOutput> => {
  const configuration = compilationConfig.pop();
  log.info('get-compilation-config', configuration);
  return { configuration };
};

export const registerGetCompilationConfig = defineBackendServiceFunction('get-compilation-config', getCompilationConfig);
