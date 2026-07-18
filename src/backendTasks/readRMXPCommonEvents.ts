import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { Marshal } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isRecord } from '@utils/rmxpUtils';
import { buildEventCommandList, isEventCommandObject, type RMXPEventCommand } from './readRMXPEvents';

/**
 * Fork-only backend task: read the FULL common events from
 * `Data/CommonEvents.rxdata` (a Marshal Array of RPG::CommonEvent, index 0 null),
 * for the common-event editor. `readRMXPCommonEventNames` (the picker) stays a
 * separate, lighter reader.
 *
 * RPG::CommonEvent = { @id, @name, @trigger (0 none / 1 autorun / 2 parallel),
 * @switch_id, @list }. The command `@list` is the SAME structure as a map event
 * page's list, so it's decoded by the shared `buildEventCommandList` — rich
 * params (audio/tone/move-route) come back keyed and IPC-safe, exactly as the
 * command editor already expects.
 */

export type ReadRMXPCommonEventsInput = { projectPath: string };

export type RMXPCommonEvent = {
  id: number;
  name: string;
  /** 0 = none, 1 = autorun, 2 = parallel. */
  trigger: number;
  /** Switch that gates autorun/parallel (RMXP always stores one; default 1). */
  switchId: number;
  list: RMXPEventCommand[];
};

export type ReadRMXPCommonEventsOutput = {
  commonEvents: RMXPCommonEvent[];
  /** Entries present in the file that failed validation and were dropped — see readRMXPEvents. */
  skipped: number;
};

export const readRMXPCommonEvents = async ({ projectPath }: ReadRMXPCommonEventsInput): Promise<ReadRMXPCommonEventsOutput> => {
  log.info('read-rmxp-common-events');
  const filePath = path.join(projectPath, 'Data', 'CommonEvents.rxdata');
  if (!fs.existsSync(filePath)) return { commonEvents: [], skipped: 0 };

  const marshalData = Marshal.load(await fsPromises.readFile(filePath));
  if (!Array.isArray(marshalData)) throw 'CommonEvents.rxdata is not a valid RMXP common event list';

  let skipped = 0;
  const commonEvents: RMXPCommonEvent[] = [];
  marshalData.forEach((entry, index) => {
    if (entry === null || entry === undefined) return; // index 0 is null in RMXP
    if (!isRecord(entry)) {
      skipped += 1;
      return;
    }
    const record = entry as Record<string, unknown>;
    const id = typeof record['@id'] === 'number' ? record['@id'] : index;
    if (id <= 0) return;
    const rawList = Array.isArray(record['@list']) ? (record['@list'] as unknown[]) : [];
    // Guard each command like the map reader; a malformed list means we can't
    // safely round-trip it, so drop the whole event rather than corrupt it.
    if (!rawList.every(isEventCommandObject)) {
      skipped += 1;
      log.warn(`Common event #${id} has an invalid command list — skipped.`);
      return;
    }
    commonEvents.push({
      id,
      name: typeof record['@name'] === 'string' ? record['@name'] : '',
      trigger: typeof record['@trigger'] === 'number' ? record['@trigger'] : 0,
      switchId: typeof record['@switch_id'] === 'number' ? record['@switch_id'] : 1,
      list: buildEventCommandList(rawList as never),
    });
  });

  log.info('read-rmxp-common-events/success', { commonEvents: commonEvents.length, skipped });
  return { commonEvents: commonEvents.sort((a, b) => a.id - b.id), skipped };
};

export const registerReadRMXPCommonEvents = defineBackendServiceFunction('read-rmxp-common-events', readRMXPCommonEvents);
