import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { Marshal, MarshalObject } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isRecord } from '@utils/rmxpUtils';
import { buildEditedList, deepCloneMarshal, type EditedCommand } from './writeRMXPEvents';

/**
 * Fork-only backend task: write common events back to `Data/CommonEvents.rxdata`
 * (a Marshal Array of RPG::CommonEvent, index 0 null, position == @id).
 *
 * Command lists use the SAME keep-protocol as map events (see writeRMXPEvents):
 * an untouched command is carried over byte-faithfully via `{ keep }` (so rich
 * params — audio/tone/move-routes — survive), and only freshly-authored commands
 * are rebuilt from plain JSON. `buildEditedList` is shared verbatim.
 *
 * Safety mirrors writeRMXPEvents: refuse to wipe a populated file, honor the
 * partial-read guard, re-load + validate the dump before touching disk, and copy
 * a `.bak` on every existing-file write.
 */

export type WriteRMXPCommonEvent = {
  id: number;
  name: string;
  trigger: number;
  switchId: number;
  /** Provenance: the id whose original `@list` a `{ keep }` references. */
  __source?: { id: number };
  /** Present when the list was edited; absent keeps the original list verbatim. */
  editedList?: EditedCommand[];
};

export type WriteRMXPCommonEventsInput = {
  projectPath: string;
  commonEvents: WriteRMXPCommonEvent[];
  /** How many entries the reader dropped — refuse to save if > 0 (would delete them). */
  skippedOnRead?: number;
};

export type WriteRMXPCommonEventsOutput = { ok: true };

type MarshalStdObject = Record<string, unknown> & { __class: symbol };

const emptyCommandList = (): MarshalStdObject[] => [{ '@code': 0, '@indent': 0, '@parameters': [], __class: Symbol.for('RPG::EventCommand') }];

/** Count real (non-null) RPG::CommonEvent entries in a loaded array. */
const countRealEvents = (arr: unknown[]): number => arr.filter((e) => isRecord(e)).length;

export const writeRMXPCommonEvents = async (payload: WriteRMXPCommonEventsInput): Promise<WriteRMXPCommonEventsOutput> => {
  log.info('write-rmxp-common-events', { commonEvents: payload.commonEvents.length });
  const filePath = path.join(payload.projectPath, 'Data', 'CommonEvents.rxdata');
  const exists = fs.existsSync(filePath);

  // Load the existing array so we can carry over untouched command lists.
  let original: unknown[] = [null];
  if (exists) {
    const loaded = Marshal.load(await fsPromises.readFile(filePath));
    if (!Array.isArray(loaded)) throw 'CommonEvents.rxdata is not a valid RMXP common event list';
    original = loaded;
  }

  // Guard: never write an empty list over a populated file (a load failure that
  // blanked the editor would otherwise erase every common event).
  const originalCount = countRealEvents(original);
  if (payload.commonEvents.length === 0 && originalCount > 0) {
    throw `Refusing to write: the editor sent 0 common events but CommonEvents.rxdata has ${originalCount}. This usually means they failed to load — reopen instead of saving.`;
  }
  if (payload.skippedOnRead && payload.skippedOnRead > 0) {
    throw `Refusing to write: ${payload.skippedOnRead} common event(s) could not be read, so saving would delete them. Fix them in RMXP first.`;
  }

  // Original command lists keyed by id (for `{ keep }` references).
  const originalListById = new Map<number, unknown>();
  original.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const id = typeof entry['@id'] === 'number' ? entry['@id'] : index;
    originalListById.set(id, entry['@list']);
  });

  // Build each RPG::CommonEvent. The array is id-indexed (position == @id) with
  // null at 0 and null in any gaps, exactly as RMXP stores it.
  const maxId = payload.commonEvents.reduce((m, e) => Math.max(m, e.id), 0);
  const result: unknown[] = new Array(maxId + 1).fill(null);
  for (const ce of payload.commonEvents) {
    if (ce.id <= 0) continue;
    // Fail-loud parity with the map writer: keeps must reference an original via
    // `__source`. If a payload with `editedList` lacks `__source`, `carried` is
    // undefined and buildEditedList throws "out of range" rather than silently
    // keeping against the id-matched list (which could clone the wrong commands).
    const list = ce.editedList
      ? buildEditedList(ce.editedList, ce.__source ? { list: originalListById.get(ce.__source.id), moveRoute: undefined } : undefined)
      : originalListById.get(ce.id) !== undefined
        ? deepCloneMarshal(originalListById.get(ce.id))
        : emptyCommandList();
    // Ivar order matches RMXP's RPG::CommonEvent#initialize (@name, @list,
    // @trigger, @switch_id, @id) so an UNTOUCHED event re-dumps byte-identically
    // — Ruby Marshal encodes ivars in first-assignment order.
    result[ce.id] = {
      '@name': ce.name,
      '@list': list,
      '@trigger': ce.trigger,
      '@switch_id': ce.switchId,
      '@id': ce.id,
      __class: Symbol.for('RPG::CommonEvent'),
    };
  }

  // Dump, then verify the dump reloads as an array with the expected count BEFORE
  // touching disk.
  const dumped = Marshal.dump(result as unknown as MarshalObject, { omitStringEncoding: true });
  const verification = Marshal.load(dumped);
  if (!Array.isArray(verification)) throw 'Verification failed: dumped common events do not reload as an array — aborting write';
  const expectedCount = payload.commonEvents.filter((e) => e.id > 0).length;
  if (countRealEvents(verification) !== expectedCount) {
    throw `Verification failed: expected ${expectedCount} common events, dump has ${countRealEvents(verification)} — aborting write`;
  }

  if (exists) await fsPromises.copyFile(filePath, `${filePath}.bak`);
  await fsPromises.writeFile(filePath, dumped);
  log.info('write-rmxp-common-events/success');
  return { ok: true };
};

export const registerWriteRMXPCommonEvents = defineBackendServiceFunction('write-rmxp-common-events', writeRMXPCommonEvents);
