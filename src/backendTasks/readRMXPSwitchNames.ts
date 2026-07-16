import log from 'electron-log';
import path from 'path';
import fsPromises from 'fs/promises';
import { Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isRecord } from '@utils/rmxpUtils';

/**
 * Fork-only backend task: read switch and variable NAMES from
 * Data/System.rxdata (@switches / @variables — arrays of names, index = id,
 * index 0 unused). Used by the event editor so page conditions and commands
 * can present named pickers instead of bare ids.
 *
 * Separate from upstream's readRMXPSystem.ts (audio-only) to keep that file
 * untouched for merges.
 */

export type ReadRMXPSwitchNamesInput = { projectPath: string };
export type ReadRMXPSwitchNamesOutput = {
  /** index = switch id; [0] is empty. Unnamed switches are ''. */
  switches: string[];
  /** index = variable id; [0] is empty. Unnamed variables are ''. */
  variables: string[];
};

const toNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => (typeof entry === 'string' ? entry : ''));
};

const readRMXPSwitchNames = async (payload: ReadRMXPSwitchNamesInput): Promise<ReadRMXPSwitchNamesOutput> => {
  log.info('read-rmxp-switch-names');
  const filePath = path.join(payload.projectPath, 'Data', 'System.rxdata');
  const marshalData = Marshal.load(await fsPromises.readFile(filePath));
  if (!isRecord(marshalData)) throw 'System.rxdata is not a valid RMXP system object';
  const system = marshalData as unknown as Record<string, unknown>;
  return {
    switches: toNames(system['@switches']),
    variables: toNames(system['@variables']),
  };
};

export const registerReadRMXPSwitchNames = defineBackendServiceFunction('read-rmxp-switch-names', readRMXPSwitchNames);
