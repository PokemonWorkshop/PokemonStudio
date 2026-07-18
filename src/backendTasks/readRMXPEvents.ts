import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { isMarshalStandardObject, isMarshalHash, Marshal, MarshalHash } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isMapObject } from './readRMXPMap';
import { isRecord } from '@utils/rmxpUtils';
import { padStr } from '@utils/PadStr';

// RMXP Documentation: https://www.rpg-maker.fr/dl/monos/aide/xp/index.html?page=source%2Frgss%2Frgss.html

export type ReadRMXPEventInput = { projectPath: string; mapId: number };
/**
 * `skipped` counts events present in the file that failed validation and were
 * dropped. It MUST be surfaced, not just logged: the editor can only save the
 * events it managed to read, so saving a partially-read map would delete the
 * dropped ones for good — and the write-side count check can't tell, because
 * the payload it receives is self-consistent.
 */
export type ReadRMXPEventOutput = { rmxpEvents: RMXPEvent[]; skipped: number };

export type RMXPEventPageCondition = {
  isSwitch1: boolean;
  isSwitch2: boolean;
  isVariable: boolean;
  isSelfSwitch: boolean;
  switch1Id: number;
  switch2Id: number;
  variableId: number;
  variableValue: number;
  selfSwitch: string;
  // Fork: enhanced conditions stored as extra @studio_* ivars on the marshal
  // Condition object (Ruby Marshal restores unknown ivars; RMXP-safe). Read
  // by the Studio_EnhancedEventConditions PSDK patch. undefined = vanilla.
  /** Expected switch 1 state (undefined/true = vanilla "is ON"). */
  switch1Expected?: boolean;
  /** Expected switch 2 state. */
  switch2Expected?: boolean;
  /** Variable comparison: 0 ==, 1 >=, 2 <=, 3 >, 4 < (undefined = vanilla >=). */
  variableOperator?: number;
  /** Ruby expression that must be truthy for the page to activate. */
  scriptCondition?: string;
  /** Time-of-day gate: 'day' | 'night' | 'morning' | 'evening' (PSDK $env). */
  timeCondition?: string;
};

export type RMXPEventPageGraphic = {
  tileId: number;
  characterName: string;
  characterHue: number;
  direction: number;
  pattern: number;
  opacity: number;
  blendType: number;
};

export type RMXPMoveCommand = {
  code: number;
  parameters: unknown[]; // Array containing the Move command arguments. The contents vary for each command.
};

export type RMXPMoveRoute = {
  isRepeat: boolean;
  isSkippable: boolean;
  list: RMXPMoveCommand[];
};

export type RMXPEventCommand = {
  code: number;
  indent: number;
  parameters: unknown[]; // Array containing the Event command arguments. The contents vary for each command.
};

export type RMXPEventPage = {
  condition: RMXPEventPageCondition;
  graphic: RMXPEventPageGraphic;
  moveType: number;
  moveSpeed: number;
  moveFrequency: number;
  moveRoute: RMXPMoveRoute;
  isWalkAnime: boolean;
  isStepAnime: boolean;
  isDirectionFix: boolean;
  isThrough: boolean;
  isAlwaysOnTop: boolean;
  trigger: number;
  list: RMXPEventCommand[];
};

export type RMXPEvent = {
  id: number;
  name: string;
  x: number;
  y: number;
  pages: RMXPEventPage[];
};

type EventPageConditionData = {
  '@switch1_valid': boolean;
  '@switch2_valid': boolean;
  '@variable_valid': boolean;
  '@self_switch_valid': boolean;
  '@switch1_id': number;
  '@switch2_id': number;
  '@variable_id': number;
  '@variable_value': number;
  '@self_switch_ch': string;
};

type EventPageGraphicData = {
  '@tile_id': number;
  '@character_name': string;
  '@character_hue': number;
  '@direction': number;
  '@pattern': number;
  '@opacity': number;
  '@blend_type': number;
};

type MoveCommandData = {
  '@code': number;
  '@parameters': unknown[];
};

type MoveRouteData = {
  '@repeat': boolean;
  '@skippable': boolean;
  '@list': MoveCommandData[];
};

type EventCommandData = {
  '@code': number;
  '@indent': number;
  '@parameters': unknown[];
};

type EventPageData = {
  '@condition': EventPageConditionData;
  '@graphic': EventPageGraphicData;
  '@move_type': number;
  '@move_speed': number;
  '@move_frequency': number;
  '@move_route': MoveRouteData;
  '@walk_anime': boolean;
  '@step_anime': boolean;
  '@direction_fix': boolean;
  '@through': boolean;
  '@always_on_top': boolean;
  '@trigger': number;
  '@list': EventCommandData[];
};

type EventData = {
  '@id': number;
  '@name': string;
  '@x': number;
  '@y': number;
  '@pages': EventPageData[];
  __class: symbol;
};

const isPageConditionObject = (object: unknown): object is EventPageConditionData =>
  isMarshalStandardObject(object) &&
  '@switch1_valid' in object &&
  '@switch2_valid' in object &&
  '@variable_valid' in object &&
  '@self_switch_valid' in object &&
  '@switch1_id' in object &&
  '@switch2_id' in object &&
  '@variable_id' in object &&
  '@variable_value' in object &&
  '@self_switch_ch' in object &&
  typeof object['@switch1_valid'] === 'boolean' &&
  typeof object['@switch2_valid'] === 'boolean' &&
  typeof object['@variable_valid'] === 'boolean' &&
  typeof object['@self_switch_valid'] === 'boolean' &&
  typeof object['@switch1_id'] === 'number' &&
  typeof object['@switch2_id'] === 'number' &&
  typeof object['@variable_id'] === 'number' &&
  typeof object['@variable_value'] === 'number' &&
  typeof object['@self_switch_ch'] === 'string';

const isPageGraphicObject = (object: unknown): object is EventPageGraphicData =>
  isMarshalStandardObject(object) &&
  '@tile_id' in object &&
  '@character_name' in object &&
  '@character_hue' in object &&
  '@direction' in object &&
  '@pattern' in object &&
  '@opacity' in object &&
  '@blend_type' in object &&
  typeof object['@tile_id'] === 'number' &&
  typeof object['@character_name'] === 'string' &&
  typeof object['@character_hue'] === 'number' &&
  typeof object['@direction'] === 'number' &&
  typeof object['@pattern'] === 'number' &&
  typeof object['@opacity'] === 'number' &&
  typeof object['@blend_type'] === 'number';

const isMoveCommandObject = (object: unknown): object is MoveCommandData =>
  isMarshalStandardObject(object) &&
  '@code' in object &&
  '@parameters' in object &&
  typeof object['@code'] === 'number' &&
  typeof object['@parameters'] === 'object';

const isMoveRouteObject = (object: unknown): object is MoveRouteData =>
  isMarshalStandardObject(object) &&
  '@repeat' in object &&
  '@skippable' in object &&
  '@list' in object &&
  typeof object['@repeat'] === 'boolean' &&
  typeof object['@skippable'] === 'boolean' &&
  Array.isArray(object['@list']) &&
  object['@list'].reduce<boolean>((prev, moveCommand) => prev && isMoveCommandObject(moveCommand), true);

export const isEventCommandObject = (object: unknown): object is EventCommandData =>
  isMarshalStandardObject(object) &&
  '@code' in object &&
  '@indent' in object &&
  '@parameters' in object &&
  typeof object['@code'] === 'number' &&
  typeof object['@indent'] === 'number' &&
  typeof object['@parameters'] === 'object';

const isEventPageObject = (object: unknown): object is EventPageData =>
  isMarshalStandardObject(object) &&
  '@condition' in object &&
  '@graphic' in object &&
  '@move_type' in object &&
  '@move_speed' in object &&
  '@move_frequency' in object &&
  '@move_route' in object &&
  '@walk_anime' in object &&
  '@step_anime' in object &&
  '@direction_fix' in object &&
  '@through' in object &&
  '@always_on_top' in object &&
  '@trigger' in object &&
  '@list' in object &&
  isPageConditionObject(object['@condition']) &&
  isPageGraphicObject(object['@graphic']) &&
  typeof object['@move_type'] === 'number' &&
  typeof object['@move_speed'] === 'number' &&
  typeof object['@move_frequency'] === 'number' &&
  isMoveRouteObject(object['@move_route']) &&
  typeof object['@walk_anime'] === 'boolean' &&
  typeof object['@step_anime'] === 'boolean' &&
  typeof object['@direction_fix'] === 'boolean' &&
  typeof object['@through'] === 'boolean' &&
  typeof object['@always_on_top'] === 'boolean' &&
  typeof object['@trigger'] === 'number' &&
  Array.isArray(object['@list']) &&
  object['@list'].reduce<boolean>((prev, eventCommand) => prev && isEventCommandObject(eventCommand), true);

const isEventObject = (object: unknown): object is EventData =>
  isMarshalStandardObject(object) &&
  '@id' in object &&
  '@name' in object &&
  '@x' in object &&
  '@y' in object &&
  '@pages' in object &&
  typeof object['@id'] === 'number' &&
  typeof object['@name'] === 'string' &&
  typeof object['@x'] === 'number' &&
  typeof object['@y'] === 'number' &&
  Array.isArray(object['@pages']) &&
  object['@pages'].reduce<boolean>((prev, page) => prev && isEventPageObject(page), true);

const buildCondition = (condition: EventPageConditionData): RMXPEventPageCondition => {
  // Fork: optional enhanced-condition ivars (see type comment above).
  const extra = condition as unknown as Record<string, unknown>;
  return {
    isSwitch1: condition['@switch1_valid'],
    isSwitch2: condition['@switch2_valid'],
    isVariable: condition['@variable_valid'],
    isSelfSwitch: condition['@self_switch_valid'],
    switch1Id: condition['@switch1_id'],
    switch2Id: condition['@switch2_id'],
    variableId: condition['@variable_id'],
    variableValue: condition['@variable_value'],
    selfSwitch: condition['@self_switch_ch'],
    ...(typeof extra['@studio_switch1_expected'] === 'boolean' ? { switch1Expected: extra['@studio_switch1_expected'] as boolean } : {}),
    ...(typeof extra['@studio_switch2_expected'] === 'boolean' ? { switch2Expected: extra['@studio_switch2_expected'] as boolean } : {}),
    ...(typeof extra['@studio_variable_operator'] === 'number' ? { variableOperator: extra['@studio_variable_operator'] as number } : {}),
    ...(typeof extra['@studio_script_condition'] === 'string' ? { scriptCondition: extra['@studio_script_condition'] as string } : {}),
    ...(typeof extra['@studio_time_condition'] === 'string' ? { timeCondition: extra['@studio_time_condition'] as string } : {}),
  };
};

const buildGraphic = (graphic: EventPageGraphicData): RMXPEventPageGraphic => ({
  tileId: graphic['@tile_id'],
  characterName: graphic['@character_name'],
  characterHue: graphic['@character_hue'],
  direction: graphic['@direction'],
  pattern: graphic['@pattern'],
  opacity: graphic['@opacity'],
  blendType: graphic['@blend_type'],
});

// This function can be updated to change the parameters output format
// It depends on what the converter will need
const buildParameter = (parameter: unknown): unknown => {
  if (parameter && typeof parameter === 'object') {
    if (Array.isArray(parameter)) return buildParameters(parameter);

    return Object.entries(parameter)
      .filter(([key]) => key !== '__class')
      .map(([, value]) => buildParameter(value));
  }
  if (typeof parameter === 'symbol') return String(parameter);

  return parameter;
};

const buildParameters = (parameters: unknown[]): unknown[] => {
  return parameters.map((parameter) => buildParameter(parameter));
};

/**
 * Move-route parameters, made safe to cross IPC.
 *
 * A raw marshal object carries a `__class` SYMBOL, and Electron's structured
 * clone throws on symbols — which would blank the whole event list and let a
 * subsequent save wipe the map's events. So nothing raw may pass through here.
 *
 * Code 44 (Play SE) is the only move command with a rich parameter. It gets a
 * plain, editable `{ name, volume, pitch }` shape — exactly what
 * writeRMXPEvents' buildAudioFile marshals back — so a Play SE survives being
 * edited, not just being carried. Everything else goes through the generic
 * (lossy-by-design) parameter reader; those commands are all plain scalars.
 */
const buildMoveParameters = (code: number, parameters: unknown[]): unknown[] => {
  if (code !== 44) return buildParameters(parameters);
  const audio = parameters[0];
  const record = audio && typeof audio === 'object' ? (audio as Record<string, unknown>) : {};
  return [
    {
      name: typeof record['@name'] === 'string' ? record['@name'] : '',
      volume: typeof record['@volume'] === 'number' ? record['@volume'] : 100,
      pitch: typeof record['@pitch'] === 'number' ? record['@pitch'] : 100,
    },
  ];
};

const buildMoveCommand = (moveCommands: MoveCommandData[]): RMXPMoveCommand[] =>
  moveCommands.map((moveCommand) => ({
    code: moveCommand['@code'],
    parameters: buildMoveParameters(moveCommand['@code'], moveCommand['@parameters']),
  }));

const buildMoveRoute = (moveRoute: MoveRouteData): RMXPMoveRoute => ({
  isRepeat: moveRoute['@repeat'],
  isSkippable: moveRoute['@skippable'],
  list: buildMoveCommand(moveRoute['@list']),
});

/**
 * Event-command parameters, made safe to cross IPC.
 *
 * Most commands hold plain scalars and go through the generic (lossy-by-design)
 * reader. Set Move Route is the exception: `buildParameter` flattens a Ruby
 * object to a bare array of its VALUES, and Ruby orders ivars by first
 * assignment — so an `RPG::MoveRoute` is `[repeat, skippable, list]` for some
 * routes and `[list, skippable, repeat]` for others. Both orders exist in the
 * real project data, so nothing may read that array positionally.
 *
 * 209 and 509 therefore reuse the SAME key-based readers as a page's own
 * move route, giving the editor one shape to work with.
 */
/** Event codes whose parameters[0] is an RPG::AudioFile (100% of 727 real uses). */
const AUDIO_CODES = new Set([132, 241, 245, 249, 250]);

const isAudioFileObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value) && '@name' in (value as Record<string, unknown>);

/**
 * Plain, editable `{ name, volume, pitch }` — exactly what writeRMXPEvents'
 * buildAudioFile marshals back, and the same shape a move-route Play SE (code
 * 44) already uses. Positional reading is impossible here: RPG::AudioFile is
 * stored in three different ivar orders across the real projects (16.2% are not
 * `[@name, @volume, @pitch]`), because Ruby orders ivars by first assignment.
 */
const buildAudioParameter = (audio: Record<string, unknown>) => ({
  name: audio['@name'],
  volume: audio['@volume'],
  pitch: audio['@pitch'],
});

/**
 * Tone (205/223/234) and Color (224) are USER-MARSHAL classes: ts-marshal keeps
 * them as `{ __class, __load: Buffer }`, where the buffer is four little-endian
 * doubles — RGSS's `_dump` is `[red, green, blue, gray|alpha].pack('d4')`.
 *
 * The generic reader would flatten that Buffer into 32 raw byte values, so decode
 * it here into a plain, editable object instead — exactly the audio treatment.
 * Values are rounded to the integers RMXP's own tone/flash pickers use (real data
 * holds artefacts like -102.00000151991844). Byte-faithfulness for an UNEDITED
 * command comes from the keep-protocol, not this rounding: writeRMXPEvents packs a
 * fresh buffer only for a tone the user actually changed.
 */
const readRichColor = (value: unknown, fourth: 'gray' | 'alpha'): Record<string, number> | null => {
  if (!value || typeof value !== 'object') return null;
  const load = (value as Record<string, unknown>).__load;
  const buf = Buffer.isBuffer(load)
    ? load
    : ArrayBuffer.isView(load)
      ? Buffer.from(load.buffer, load.byteOffset, load.byteLength)
      : Array.isArray(load)
        ? Buffer.from(load)
        : null;
  if (!buf || buf.length < 32) return null;
  return {
    red: Math.round(buf.readDoubleLE(0)),
    green: Math.round(buf.readDoubleLE(8)),
    blue: Math.round(buf.readDoubleLE(16)),
    [fourth]: Math.round(buf.readDoubleLE(24)),
  };
};

const buildEventParameters = (code: number, parameters: unknown[]): unknown[] => {
  if (code === 209 && isMoveRouteObject(parameters[1])) {
    return [buildParameter(parameters[0]), buildMoveRoute(parameters[1])];
  }
  if (code === 509 && isMoveCommandObject(parameters[0])) {
    return [buildMoveCommand([parameters[0]])[0]];
  }
  // Guarded like 209/509: anything malformed falls through to the generic
  // reader rather than being silently rewritten with empty defaults.
  if (AUDIO_CODES.has(code) && isAudioFileObject(parameters[0])) {
    return [buildAudioParameter(parameters[0]), ...buildParameters(parameters.slice(1))];
  }
  // Tone/Color commands: decode the user-marshal buffer to a plain object.
  // 205/223 carry a Tone at [0], 224 a Color at [0], 234 a Tone at [1] (its [0]
  // is the picture number). Guarded — a malformed param falls through.
  if (code === 205 || code === 223) {
    const tone = readRichColor(parameters[0], 'gray');
    if (tone) return [tone, ...buildParameters(parameters.slice(1))];
  }
  if (code === 224) {
    const color = readRichColor(parameters[0], 'alpha');
    if (color) return [color, ...buildParameters(parameters.slice(1))];
  }
  if (code === 234) {
    const tone = readRichColor(parameters[1], 'gray');
    if (tone) return [buildParameter(parameters[0]), tone, ...buildParameters(parameters.slice(2))];
  }
  return buildParameters(parameters);
};

/** Decode a raw `@list` of RPG::EventCommand into the renderer shape (IPC-safe,
 *  rich params keyed). Shared with the common-event reader. */
export const buildEventCommandList = (eventCommands: EventCommandData[]): RMXPEventCommand[] =>
  eventCommands.map((eventCommand) => ({
    code: eventCommand['@code'],
    indent: eventCommand['@indent'],
    parameters: buildEventParameters(eventCommand['@code'], eventCommand['@parameters']),
  }));

const buildEventPages = (pages: EventPageData[]): RMXPEventPage[] => {
  return pages.map((page) => ({
    condition: buildCondition(page['@condition']),
    graphic: buildGraphic(page['@graphic']),
    moveType: page['@move_type'],
    moveSpeed: page['@move_speed'],
    moveFrequency: page['@move_frequency'],
    moveRoute: buildMoveRoute(page['@move_route']),
    isWalkAnime: page['@walk_anime'],
    isStepAnime: page['@step_anime'],
    isDirectionFix: page['@direction_fix'],
    isThrough: page['@through'],
    isAlwaysOnTop: page['@always_on_top'],
    trigger: page['@trigger'],
    list: buildEventCommandList(page['@list']),
  }));
};

const buildEvents = (eventHash: MarshalHash, mapId: number): { events: RMXPEvent[]; skipped: number } => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __class, __extendedModules, __default, ...events } = eventHash;
  let skipped = 0;
  const built = Object.entries(events)
    .map(([id, data]) => {
      if (!isEventObject(data)) {
        // Counted, not just warned — see ReadRMXPEventOutput.
        skipped += 1;
        log.warn(`The event #${id} in the file Map${padStr(mapId, 3)}.rxdata is invalid.`);
        return undefined;
      }

      log.info(`Read event #${data['@id']} (${data['@name']})`);
      return { id: data['@id'], name: data['@name'], x: data['@x'], y: data['@y'], pages: buildEventPages(data['@pages']) };
    })
    .filter(<T>(data: T): data is Exclude<T, undefined> => !!data);
  return { events: built, skipped };
};

export const readRMXPEvents = async (projectPath: string, mapId: number): Promise<{ events: RMXPEvent[]; skipped: number }> => {
  const filePath = path.join(projectPath, 'Data', `Map${padStr(mapId, 3)}.rxdata`);
  // A map authored in Studio has no .rxdata until PSDK's Tiled2Rxdata runs at
  // game boot. That's an empty event list, not an error — writeRMXPEvents
  // creates the file if the user saves events into it.
  if (!fs.existsSync(filePath)) {
    log.info('read-rmxp-events/no-rxdata-yet', { mapId });
    return { events: [], skipped: 0 };
  }
  const mapData = await fsPromise.readFile(filePath);
  const marshalMapData = Marshal.load(mapData);

  if (!isRecord(marshalMapData)) throw new Error('Loaded object is not a Record');
  if (!isMapObject(marshalMapData)) throw new Error(`The file Map${padStr(mapId, 3)}.rxdata is not a valid map object.`);

  const eventsData = marshalMapData['@events'];
  if (!isMarshalHash(eventsData)) throw new Error('Loaded object is not a Hash');

  return buildEvents(eventsData, mapId);
};

const readRMXPEventsBackendService = async (payload: ReadRMXPEventInput): Promise<ReadRMXPEventOutput> => {
  log.info('read-rmxp-events', payload);

  const { events, skipped } = await readRMXPEvents(payload.projectPath, payload.mapId);

  log.info('read-rmxp-events/success', { events: events.length, skipped });
  return { rmxpEvents: events, skipped };
};

export const registerReadRMXPEvents = defineBackendServiceFunction('read-rmxp-events', readRMXPEventsBackendService);
