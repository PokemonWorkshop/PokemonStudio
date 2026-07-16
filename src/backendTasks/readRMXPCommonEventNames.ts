import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isRecord } from '@utils/rmxpUtils';

/**
 * Fork-only backend task: read common event NAMES from Data/CommonEvents.rxdata
 * (an Array of RPG::CommonEvent indexed by id, with a null at 0). Used by the
 * event editor so "Call Common Event" can offer a named picker instead of
 * RMXP's bare numeric list.
 *
 * Mirrors readRMXPSwitchNames — separate from upstream's readers so those files
 * stay untouched for merges.
 */

export type ReadRMXPCommonEventNamesInput = { projectPath: string };
export type ReadRMXPCommonEventNamesOutput = {
  /**
   * Only the entries that really exist. A list rather than an id-indexed array
   * because an UNNAMED common event is real and must stay pickable — an array
   * of names can't tell `''` (exists, unnamed) from `''` (no such id).
   */
  commonEvents: { id: number; name: string }[];
};

export const readRMXPCommonEventNames = async (payload: ReadRMXPCommonEventNamesInput): Promise<ReadRMXPCommonEventNamesOutput> => {
  log.info('read-rmxp-common-event-names');
  const filePath = path.join(payload.projectPath, 'Data', 'CommonEvents.rxdata');
  // A project may legitimately have none — treat that as an empty list rather
  // than an error, the same way a map with no .rxdata reads as no events.
  if (!fs.existsSync(filePath)) return { commonEvents: [] };

  const marshalData = Marshal.load(await fsPromises.readFile(filePath));
  if (!Array.isArray(marshalData)) throw 'CommonEvents.rxdata is not a valid RMXP common event list';

  // Key on @id rather than array position. They agree in the real data, but the
  // id is what command_117 actually looks up. Index 0 is always null in RMXP.
  const commonEvents: { id: number; name: string }[] = [];
  marshalData.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const record = entry as unknown as Record<string, unknown>;
    const id = typeof record['@id'] === 'number' ? record['@id'] : index;
    if (id <= 0) return; // $data_common_events[0] is nil — not a callable event
    commonEvents.push({ id, name: typeof record['@name'] === 'string' ? record['@name'] : '' });
  });
  return { commonEvents: commonEvents.sort((a, b) => a.id - b.id) };
};

export const registerReadRMXPCommonEventNames = defineBackendServiceFunction('read-rmxp-common-event-names', readRMXPCommonEventNames);
