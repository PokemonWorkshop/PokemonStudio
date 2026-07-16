import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { Marshal, MarshalObject } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { padStr } from '@utils/PadStr';
import { isRecord } from '@utils/rmxpUtils';
import { isMapObject } from './readRMXPMap';
import type { RMXPEvent, RMXPEventPage } from './readRMXPEvents';

/**
 * Fork-only backend task: write RMXP event SHELL edits back into
 * `Data/Map###.rxdata` (Marshal) — the same file RMXP and PSDK use, so
 * edited events run in-game immediately and RMXP stays usable in parallel.
 *
 * IMPORTANT DESIGN CONSTRAINT — command lists are preserved, not rebuilt:
 * readRMXPEvents' JSON is lossy for command parameters (it strips `__class`
 * from embedded Ruby objects like RPG::MoveCommand/RPG::AudioFile/Color), so
 * this task NEVER reconstructs `@list` / `@move_route` from renderer JSON.
 * Instead each incoming page carries provenance (`__source`) pointing at the
 * original event/page whose `@list` + `@move_route` should be carried over
 * (deep-cloned from the freshly-loaded file). Pages without provenance are
 * new and get empty lists. Everything else about the map object (tile Table,
 * audio settings, …) is loaded and re-dumped untouched — round-trip safety
 * for all 22 project maps is covered by the ts-marshal patch
 * (patches/ts-marshal+0.0.11.patch, negative-fixnum fix).
 *
 * Safety: the pre-edit file is copied to `Map###.rxdata.bak` on EVERY write,
 * and the dump is re-loaded + sanity-checked before touching the original.
 */

/**
 * Command-list edit protocol. When a page's list was modified in the editor,
 * it ships an `editedList`: each entry either KEEPS an original command from
 * the source page (`{ keep: index }` — cloned byte-faithfully, preserving
 * rich class-tagged parameters like RPG::AudioFile/Tone/Color), or provides
 * a brand-new command whose parameters are plain JSON (strings/numbers/
 * arrays), which is all the editor is allowed to author.
 */
/**
 * `indent` travels with a KEEP because the editor can re-indent a command it is
 * otherwise carrying verbatim — dragging one into a branch does exactly that.
 * Without it the clone keeps the ORIGINAL indent, which silently un-nests the
 * command: `command_skip` only skips while the next indent differs from the
 * opener's, so a body command left at the opener's indent runs even when the
 * condition is false. Everything else about the original is still cloned.
 */
export type EditedCommand = { keep: number; indent: number } | { code: number; indent: number; parameters: unknown[] };

/**
 * Move-route edit protocol — same keep-or-new idea as `editedList`, but for
 * `@move_route`. A kept entry is cloned byte-faithfully from the ORIGINAL page's
 * route (which is how an untouched `Play SE` holds on to its RPG::AudioFile);
 * a new entry carries plain JSON only. Code 44 is the one exception: its single
 * parameter arrives as `{ name, volume, pitch }` and is marshalled back into a
 * real RPG::AudioFile here, since the renderer can't build one.
 */
export type EditedMoveCommand = { keep: number } | { code: number; parameters: unknown[] };
export type EditedMoveRoute = { repeat: boolean; skippable: boolean; list: EditedMoveCommand[] };

export type WriteRMXPEventPage = RMXPEventPage & {
  /**
   * Provenance stamped by the renderer at load. `listLength`/`routeLength` are
   * the ORIGINAL lengths, so the renderer can tell "unchanged" from "trailing
   * entries deleted" — both leave a sequential run of `__keep` indices.
   */
  __source?: { eventId: number; pageIndex: number; listLength?: number; routeLength?: number; listIndents?: number[] };
  editedList?: EditedCommand[];
  editedMoveRoute?: EditedMoveRoute;
};
export type WriteRMXPEvent = Omit<RMXPEvent, 'pages'> & { pages: WriteRMXPEventPage[] };
export type WriteRMXPEventsInput = {
  projectPath: string;
  mapId: number;
  events: WriteRMXPEvent[];
  /**
   * How many events readRMXPEvents dropped when this map was loaded. The editor
   * refuses to save a partially-read map, but the invariant is enforced here too
   * — a caller that forgets the check would otherwise silently delete whatever
   * failed to load, and the post-dump count check can't detect it (the payload
   * is self-consistent).
   */
  skippedOnRead?: number;
  /**
   * The map's size in tiles, from the .tmx the editor has open. A fast path for
   * when `Map###.rxdata` doesn't exist yet (a map authored in Studio and not
   * booted in PSDK since) — see `buildBlankMap`. If absent, the size is read
   * straight from the `.tmx` via `tiledFilename` (the reliable source of truth).
   */
  mapSize?: { width: number; height: number };
  /**
   * The map's `.tmx` filename (no extension), e.g. "022 My Map". Used to read the
   * map's real size from `Data/Tiled/Maps/<tiledFilename>.tmx` when synthesizing
   * a blank `Map###.rxdata` and `mapSize` wasn't supplied. This makes saving
   * events onto a brand-new map work without first booting the game.
   */
  tiledFilename?: string;
};
export type WriteRMXPEventsOutput = { ok: true };

type MarshalStdObject = Record<string, unknown> & { __class: symbol };

/**
 * A blank RPG::Table of tile ids, matching `Table.new(width, height, 3)`.
 *
 * ts-marshal keeps user-marshal classes as `{ __class, __load: Buffer }` and
 * re-dumps the buffer verbatim, so the payload has to be laid out exactly as
 * RMXP's `Table#_dump` does: five int32 LE (dimension count, xsize, ysize,
 * zsize, cell count) followed by one int16 LE per cell. Verified against a real
 * map: 25x27 → header [3, 25, 27, 3, 2025] and 4070 payload bytes (20 + 2025*2).
 */
const buildTileTable = (width: number, height: number): MarshalStdObject => {
  const LAYERS = 3; // RMXP maps always have exactly three tile layers
  const cells = width * height * LAYERS;
  const payload = Buffer.alloc(20 + cells * 2); // zero-filled = every cell empty
  payload.writeInt32LE(3, 0); // dimension count
  payload.writeInt32LE(width, 4);
  payload.writeInt32LE(height, 8);
  payload.writeInt32LE(LAYERS, 12);
  payload.writeInt32LE(cells, 16);
  return { __class: Symbol.for('Table'), __load: payload };
};

const blankAudioFile = (volume: number): MarshalStdObject => ({
  __class: Symbol.for('RPG::AudioFile'),
  '@name': '',
  '@volume': volume,
  '@pitch': 100,
});

/**
 * The map object PSDK's own `RPG::Map.new(width, height)` produces — the exact
 * fallback Tiled2Rxdata's `Map#load` uses when no .rxdata exists yet. Studio
 * can't do the full .tmx -> .rxdata conversion (that also generates tileset
 * images), but it doesn't need to: the boot-time conversion overwrites @data and
 * @tileset_id in place and never touches @events, so events written into this
 * blank map survive it.
 */
const buildBlankMap = (width: number, height: number): MarshalStdObject => ({
  __class: Symbol.for('RPG::Map'),
  '@tileset_id': 1,
  '@width': width,
  '@height': height,
  '@autoplay_bgm': false,
  '@bgm': blankAudioFile(100),
  '@autoplay_bgs': false,
  '@bgs': blankAudioFile(80),
  '@encounter_list': [],
  '@encounter_step': 30,
  '@data': buildTileTable(width, height),
  '@events': new Map<unknown, unknown>(),
});

/**
 * Deep clone for marshal object graphs (plain objects with symbol keys/values,
 * arrays, Maps). Binary leaves (Buffer / typed arrays / ArrayBuffer / Date) are
 * returned AS-IS: ts-marshal keeps user-marshal payloads (e.g. the map's
 * `Table` tile data, RPG::AudioFile bytes, Tone/Color) as real Buffers and
 * calls `.copy()` on them at dump time — cloning them into plain objects would
 * strip that method and crash with "bytes.copy is not a function". We never
 * mutate these leaves, so sharing the reference is safe.
 */
const deepCloneMarshal = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(deepCloneMarshal);
  if (value instanceof Map) {
    const out = new Map<unknown, unknown>();
    value.forEach((v, k) => out.set(deepCloneMarshal(k), deepCloneMarshal(v)));
    return out;
  }
  // Binary / special leaves — keep the original instance intact.
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Date) return value;
  if (value && typeof value === 'object') {
    const out: Record<string | symbol, unknown> = {};
    for (const key of Reflect.ownKeys(value)) {
      out[key] = deepCloneMarshal((value as Record<string | symbol, unknown>)[key]);
    }
    return out;
  }
  return value; // primitives + symbols are immutable
};

const emptyMoveRoute = (): MarshalStdObject => ({
  // RMXP's RPG::MoveRoute#initialize defaults @repeat to true — match it, and
  // match createEmptyPage() in rmxpEventUtils, which already did.
  '@repeat': true,
  '@skippable': false,
  '@list': [{ '@code': 0, '@parameters': [], __class: Symbol.for('RPG::MoveCommand') }],
  __class: Symbol.for('RPG::MoveRoute'),
});

const emptyCommandList = (): MarshalStdObject[] => [{ '@code': 0, '@indent': 0, '@parameters': [], __class: Symbol.for('RPG::EventCommand') }];

/** Build a page's @list from the edit protocol (keep-references + fresh plain commands). */
const buildEditedList = (editedList: EditedCommand[], carried: { list: unknown; moveRoute: unknown } | undefined): unknown[] => {
  const originalList = carried && Array.isArray(carried.list) ? (carried.list as unknown[]) : [];
  const built = editedList.map((entry) => {
    if ('keep' in entry) {
      const original = originalList[entry.keep];
      if (original === undefined) throw `editedList keep=${entry.keep} is out of range (original list has ${originalList.length} commands)`;
      const clone = deepCloneMarshal(original);
      // The command is carried verbatim, but it may have been re-indented.
      if (isRecord(clone) && typeof entry.indent === 'number') clone['@indent'] = entry.indent;
      return clone;
    }
    return {
      '@code': entry.code,
      '@indent': entry.indent,
      '@parameters': buildEventParameters(entry.code, entry.parameters),
      __class: Symbol.for('RPG::EventCommand'),
    };
  });
  // Hard invariant from RMXP: every list terminates with a blank code-0 command.
  const last = built[built.length - 1] as Record<string, unknown> | undefined;
  if (!last || last['@code'] !== 0) built.push({ '@code': 0, '@indent': 0, '@parameters': [], __class: Symbol.for('RPG::EventCommand') });
  return built;
};

/**
 * Marshal an RPG::AudioFile from the plain `{ name, volume, pitch }` the editor
 * sends (see readRMXPEvents' buildMoveParameters). The `@`-prefixed shape is
 * also accepted defensively, so a raw marshal object can never silently
 * degrade into an empty SE.
 */
const buildAudioFile = (value: unknown): MarshalStdObject => {
  const audio = isRecord(value) ? value : {};
  const pick = <T>(plain: unknown, ivar: unknown, fallback: T, kind: 'string' | 'number'): T =>
    (typeof plain === kind ? plain : typeof ivar === kind ? ivar : fallback) as T;
  return {
    '@name': pick(audio.name, audio['@name'], '', 'string'),
    '@volume': pick(audio.volume, audio['@volume'], 100, 'number'),
    '@pitch': pick(audio.pitch, audio['@pitch'], 100, 'number'),
    __class: Symbol.for('RPG::AudioFile'),
  };
};

/**
 * Parameters for a freshly-authored move command. Two need care:
 *   * 41 (Change Graphic) — parameters[0] is a character name resolved by
 *     RPG::Cache, so it must have NO extension, exactly like
 *     `@graphic['@character_name']`. An extensioned name makes PSDK hand raw
 *     PNG bytes back as a String and die on `.width`, mid-route.
 *   * 44 (Play SE) — the only move command with a rich param.
 */
const buildMoveParameters = (code: number, parameters: unknown[]): unknown[] => {
  if (code === 44) return [buildAudioFile(parameters[0])];
  if (code === 41) {
    const [name, ...rest] = parameters;
    return [typeof name === 'string' ? name.replace(/\.(png|gif)$/i, '') : name, ...rest];
  }
  return parameters;
};

/** Build a page's @move_route from the edit protocol (keep-references + fresh commands). */
const buildEditedMoveRoute = (edited: EditedMoveRoute, carried: { list: unknown; moveRoute: unknown } | undefined): MarshalStdObject => {
  const original = isRecord(carried?.moveRoute) && Array.isArray(carried?.moveRoute['@list']) ? (carried?.moveRoute['@list'] as unknown[]) : [];
  const built = edited.list.map((entry) => {
    if ('keep' in entry) {
      const source = original[entry.keep];
      if (source === undefined) throw `editedMoveRoute keep=${entry.keep} is out of range (original route has ${original.length} commands)`;
      return deepCloneMarshal(source);
    }
    return {
      '@code': entry.code,
      '@parameters': buildMoveParameters(entry.code, entry.parameters),
      __class: Symbol.for('RPG::MoveCommand'),
    };
  });
  // Hard invariant from RMXP: the route terminates with a blank code-0 command.
  const last = built[built.length - 1] as Record<string, unknown> | undefined;
  if (!last || last['@code'] !== 0) built.push({ '@code': 0, '@parameters': [], __class: Symbol.for('RPG::MoveCommand') });
  return {
    '@repeat': edited.repeat,
    '@skippable': edited.skippable,
    '@list': built,
    __class: Symbol.for('RPG::MoveRoute'),
  };
};

/** One `RPG::MoveCommand` from the renderer's plain `{ code, parameters }`. */
const buildFreshMoveCommand = (value: unknown): MarshalStdObject => {
  const record = isRecord(value) ? value : {};
  const code = typeof record.code === 'number' ? record.code : 0;
  const parameters = Array.isArray(record.parameters) ? record.parameters : [];
  return { '@code': code, '@parameters': buildMoveParameters(code, parameters), __class: Symbol.for('RPG::MoveCommand') };
};

/**
 * An `RPG::MoveRoute` for a freshly-authored Set Move Route (209), from the
 * renderer's plain `{ isRepeat, isSkippable, list }` — the same shape
 * readRMXPEvents gives for a page's own move route.
 */
const buildFreshMoveRoute = (value: unknown): MarshalStdObject => {
  const record = isRecord(value) ? value : {};
  const list = (Array.isArray(record.list) ? record.list : []).map(buildFreshMoveCommand);
  // Same hard invariant as a page's route: it terminates with a blank code-0.
  const last = list[list.length - 1] as Record<string, unknown> | undefined;
  if (!last || last['@code'] !== 0) list.push({ '@code': 0, '@parameters': [], __class: Symbol.for('RPG::MoveCommand') });
  return {
    '@repeat': typeof record.isRepeat === 'boolean' ? record.isRepeat : false,
    '@skippable': typeof record.isSkippable === 'boolean' ? record.isSkippable : false,
    '@list': list,
    __class: Symbol.for('RPG::MoveRoute'),
  };
};

/**
 * Parameters for a freshly-authored EVENT command.
 *
 * Set Move Route is the only one the editor authors that holds a rich Ruby
 * object. 209 carries the whole `RPG::MoveRoute`; each following 509 mirrors ONE
 * of its commands for RMXP's editor (PSDK has no command_509 — it reads the
 * route from 209's parameter). Everything else is plain JSON by design.
 */
/**
 * Event codes whose parameters hold class-tagged Ruby objects the editor cannot
 * author yet. Measured across the real projects: 250/249/241/245/132 carry an
 * RPG::AudioFile, 223/234/205 a Tone, 224 a Color.
 *
 * Authoring one today would write a plain Ruby Array where PSDK expects an
 * object and crash the game at runtime (`audio.name` on an Array). The renderer
 * can't reach this — `isChainEditable` gates the authorable set — but that gate
 * is one line away from someone adding a code here, and the failure is silent
 * and catastrophic. So refuse loudly instead of writing something broken.
 */
/**
 * Pack a Tone (205/223/234) or Color (224) back into its user-marshal payload:
 * four little-endian doubles, exactly what RGSS's `_dump` writes
 * (`[red, green, blue, gray|alpha].pack('d4')`). The renderer sends the plain
 * `{ red, green, blue, gray }` / `{ red, green, blue, alpha }` object
 * readRMXPEvents decoded from the buffer.
 *
 * An UNEDITED tone command never reaches here — it rides the keep-protocol and
 * is cloned byte-for-byte, artefacts included. This runs only for a tone the
 * user actually changed, so packing exact doubles for their chosen integers is
 * both correct and what RMXP would write.
 */
const buildRichColor = (className: 'Tone' | 'Color', value: unknown, fourth: 'gray' | 'alpha'): MarshalStdObject => {
  const rec = isRecord(value) ? value : {};
  const at = (key: string): number => (typeof rec[key] === 'number' ? (rec[key] as number) : 0);
  const load = Buffer.alloc(32);
  load.writeDoubleLE(at('red'), 0);
  load.writeDoubleLE(at('green'), 8);
  load.writeDoubleLE(at('blue'), 16);
  load.writeDoubleLE(at(fourth), 24);
  return { __class: Symbol.for(className), __load: load };
};

/**
 * Codes whose parameters still hold a class-tagged Ruby object this task cannot
 * build. Empty now that Tone/Color (205/223/224/234) are packed by
 * `buildRichColor` — kept as the guard rail for any FUTURE user-marshal param a
 * caller might wire into the authorable set: refuse loudly rather than write a
 * plain Ruby Array where PSDK expects an object and crash the game at runtime.
 */
const RICH_PARAM_CODES = new Map<number, string>([]);

/** Codes whose parameters[0] is an RPG::AudioFile (verified: 100% of 727 real uses). */
const AUDIO_CODES = new Set([132, 241, 245, 249, 250]);

const buildEventParameters = (code: number, parameters: unknown[]): unknown[] => {
  if (code === 209) return [parameters[0], buildFreshMoveRoute(parameters[1])];
  if (code === 509) return [buildFreshMoveCommand(parameters[0])];
  if (AUDIO_CODES.has(code)) return [buildAudioFile(parameters[0]), ...parameters.slice(1)];
  // Tone/Color: pack the plain object back into the user-marshal buffer. 205/223
  // carry a Tone at [0], 224 a Color at [0], 234 a Tone at [1] (picture number [0]).
  if (code === 205 || code === 223) return [buildRichColor('Tone', parameters[0], 'gray'), ...parameters.slice(1)];
  if (code === 224) return [buildRichColor('Color', parameters[0], 'alpha'), ...parameters.slice(1)];
  if (code === 234) return [parameters[0], buildRichColor('Tone', parameters[1], 'gray'), ...parameters.slice(2)];
  const rich = RICH_PARAM_CODES.get(code);
  if (rich) throw `Refusing to write command ${code}: its parameters need a real ${rich}, which this task can't build yet. Authoring it would corrupt the map.`;
  return parameters;
};

const buildPage = (page: WriteRMXPEventPage, carried: { list: unknown; moveRoute: unknown } | undefined): MarshalStdObject => ({
  '@condition': {
    '@switch1_valid': page.condition.isSwitch1,
    '@switch2_valid': page.condition.isSwitch2,
    '@variable_valid': page.condition.isVariable,
    '@self_switch_valid': page.condition.isSelfSwitch,
    '@switch1_id': page.condition.switch1Id,
    '@switch2_id': page.condition.switch2Id,
    '@variable_id': page.condition.variableId,
    '@variable_value': page.condition.variableValue,
    '@self_switch_ch': page.condition.selfSwitch,
    // Fork: enhanced conditions as extra ivars — Ruby Marshal restores them,
    // the Studio_EnhancedEventConditions PSDK patch consumes them, and RMXP
    // simply ignores them. Only written when they differ from vanilla.
    ...(page.condition.switch1Expected === false ? { '@studio_switch1_expected': false } : {}),
    ...(page.condition.switch2Expected === false ? { '@studio_switch2_expected': false } : {}),
    ...(page.condition.variableOperator !== undefined && page.condition.variableOperator !== 1
      ? { '@studio_variable_operator': page.condition.variableOperator }
      : {}),
    ...(page.condition.scriptCondition ? { '@studio_script_condition': page.condition.scriptCondition } : {}),
    ...(page.condition.timeCondition ? { '@studio_time_condition': page.condition.timeCondition } : {}),
    __class: Symbol.for('RPG::Event::Page::Condition'),
  },
  '@graphic': {
    '@tile_id': page.graphic.tileId,
    // RMXP/PSDK convention: no file extension in @character_name (RPG::Cache
    // resolves it). Normalize defensively — an extensioned name makes PSDK
    // return raw PNG bytes as a String and crash on `.width` at map load.
    '@character_name': page.graphic.characterName.replace(/\.(png|gif)$/i, ''),
    '@character_hue': page.graphic.characterHue,
    '@direction': page.graphic.direction,
    '@pattern': page.graphic.pattern,
    '@opacity': page.graphic.opacity,
    '@blend_type': page.graphic.blendType,
    __class: Symbol.for('RPG::Event::Page::Graphic'),
  },
  '@move_type': page.moveType,
  '@move_speed': page.moveSpeed,
  '@move_frequency': page.moveFrequency,
  '@move_route': page.editedMoveRoute
    ? buildEditedMoveRoute(page.editedMoveRoute, carried)
    : carried
      ? deepCloneMarshal(carried.moveRoute)
      : emptyMoveRoute(),
  '@walk_anime': page.isWalkAnime,
  '@step_anime': page.isStepAnime,
  '@direction_fix': page.isDirectionFix,
  '@through': page.isThrough,
  '@always_on_top': page.isAlwaysOnTop,
  '@trigger': page.trigger,
  '@list': page.editedList ? buildEditedList(page.editedList, carried) : carried ? deepCloneMarshal(carried.list) : emptyCommandList(),
  __class: Symbol.for('RPG::Event::Page'),
});

/**
 * Count real entries in a marshal `@events` hash. ts-marshal loads Ruby hashes
 * as plain objects carrying bookkeeping keys (`__class`, sometimes `__default`)
 * which must never be counted as events.
 */
const countMarshalEvents = (events: unknown): number => {
  if (events instanceof Map) return events.size;
  if (!isRecord(events)) return 0;
  return Object.keys(events).filter((key) => key !== '__class' && key !== '__default').length;
};

/** Extract original pages' list/move_route keyed by `${eventId}:${pageIndex}` from the loaded file. */
const indexOriginalPages = (events: unknown): Map<string, { list: unknown; moveRoute: unknown }> => {
  const index = new Map<string, { list: unknown; moveRoute: unknown }>();
  const each = (cb: (id: unknown, ev: unknown) => void) => {
    if (events instanceof Map) events.forEach((ev, id) => cb(id, ev));
    else if (isRecord(events)) Object.entries(events).forEach(([id, ev]) => cb(Number(id), ev));
  };
  each((id, ev) => {
    if (!isRecord(ev) || !Array.isArray(ev['@pages'])) return;
    (ev['@pages'] as unknown[]).forEach((page, pageIndex) => {
      if (!isRecord(page)) return;
      index.set(`${id}:${pageIndex}`, { list: page['@list'], moveRoute: page['@move_route'] });
    });
  });
  return index;
};

/**
 * Read a map's tile size straight from its `.tmx` root (`<map width height>`).
 * The source of truth for a brand-new map's dimensions, used when synthesizing a
 * blank `Map###.rxdata` and the renderer didn't hand us a `mapSize`. Returns
 * undefined if the file is missing or the attributes can't be parsed.
 */
const readTmxSize = async (projectPath: string, tiledFilename: string): Promise<{ width: number; height: number } | undefined> => {
  try {
    const tmxPath = path.join(projectPath, 'Data', 'Tiled', 'Maps', `${tiledFilename}.tmx`);
    const xml = await fsPromises.readFile(tmxPath, 'utf8');
    const mapTag = xml.match(/<map\b[^>]*>/);
    if (!mapTag) return undefined;
    const width = Number(mapTag[0].match(/\bwidth="(\d+)"/)?.[1]);
    const height = Number(mapTag[0].match(/\bheight="(\d+)"/)?.[1]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return undefined;
    return { width, height };
  } catch {
    return undefined;
  }
};

// Exported (like readRMXPEvents) so the write path can be exercised directly —
// this is the one function in the codebase that can destroy a user's real maps.
export const writeRMXPEvents = async (payload: WriteRMXPEventsInput): Promise<WriteRMXPEventsOutput> => {
  log.info('write-rmxp-events', { mapId: payload.mapId, events: payload.events.length });
  const filePath = path.join(payload.projectPath, 'Data', `Map${padStr(payload.mapId, 3)}.rxdata`);
  const exists = fs.existsSync(filePath);

  // A map authored in Studio only gets its .rxdata when PSDK's Tiled2Rxdata
  // tool runs at game boot, so a brand-new map has none and events had nowhere
  // to go. Synthesize the same blank-but-valid RPG::Map that Tiled2Rxdata's own
  // `Map#load` falls back to (`RPG::Map.new(w, h)`) and write the events into
  // it. The later conversion pass overwrites @data/@tileset_id in place and
  // never touches @events, so nothing here is lost.
  let mapObject: unknown;
  if (exists) {
    mapObject = Marshal.load(await fsPromises.readFile(filePath));
    if (!isRecord(mapObject) || !isMapObject(mapObject)) throw `Map${padStr(payload.mapId, 3)}.rxdata is not a valid RMXP map`;
  } else {
    // No events and no file: nothing to record. Writing a blank map here would
    // only replace `Map#load`'s always-correct `RPG::Map.new(@width, @height)`
    // fallback with a file whose dimensions are a guess — a downgrade for no gain.
    if (payload.events.length === 0) {
      log.info('write-rmxp-events/nothing-to-write', { mapId: payload.mapId });
      return { ok: true };
    }
    // Size comes from the renderer's open .tmx (fast path) or, failing that, is
    // read straight from the .tmx on disk — so eventing on a brand-new map and
    // saving works without booting the game to generate the .rxdata first.
    const size = payload.mapSize ?? (payload.tiledFilename ? await readTmxSize(payload.projectPath, payload.tiledFilename) : undefined);
    if (!size) throw `Map${padStr(payload.mapId, 3)}.rxdata doesn't exist yet and the map's size is unknown, so it can't be created.`;
    log.info('write-rmxp-events/creating-blank-map', size);
    mapObject = buildBlankMap(size.width, size.height);
  }
  if (!isRecord(mapObject)) throw `Map${padStr(payload.mapId, 3)}.rxdata could not be prepared`;

  const originalPages = indexOriginalPages(mapObject['@events']);

  // Guard against writing an empty event list over a populated map. If the
  // renderer ever fails to LOAD the events (it blanks its list on error), a
  // save would otherwise erase every event — and the count check below would
  // happily pass, because 0 === 0. Deleting the last event by hand is real but
  // rare; recovering a wiped map is not worth that convenience.
  const originalEventCount = countMarshalEvents(mapObject['@events']);
  if (payload.events.length === 0 && originalEventCount > 0) {
    throw `Refusing to write: the editor sent 0 events but Map${padStr(payload.mapId, 3)}.rxdata has ${originalEventCount}. This usually means the events failed to load — reopen the map instead of saving.`;
  }
  // Partial load loss. Deleting an event is legitimate, so a count comparison
  // can't catch this — only the reader knows it dropped something.
  if (payload.skippedOnRead && payload.skippedOnRead > 0) {
    throw `Refusing to write: ${payload.skippedOnRead} event(s) in Map${padStr(payload.mapId, 3)}.rxdata could not be read, so saving would delete them. Fix or remove them in RMXP first.`;
  }

  // Rebuild @events as a Ruby Hash (id => RPG::Event), applying shell edits
  // and carrying original command lists/move routes via page provenance.
  const newEvents = new Map<MarshalObject, MarshalObject>();
  for (const event of [...payload.events].sort((a, b) => a.id - b.id)) {
    const pages = event.pages.map((page) => {
      const source = page.__source;
      const carried = source ? originalPages.get(`${source.eventId}:${source.pageIndex}`) : undefined;
      return buildPage(page, carried);
    });
    newEvents.set(event.id, {
      '@id': event.id,
      '@name': event.name,
      '@x': event.x,
      '@y': event.y,
      '@pages': pages,
      __class: Symbol.for('RPG::Event'),
    } as unknown as MarshalObject);
  }
  (mapObject as Record<string, unknown>)['@events'] = newEvents;

  // Dump, then verify the dump reloads as a valid map BEFORE touching disk.
  const dumped = Marshal.dump(mapObject as MarshalObject, { omitStringEncoding: true });
  const verification = Marshal.load(dumped);
  if (!isRecord(verification) || !isMapObject(verification)) throw 'Verification failed: dumped map does not reload as a valid RMXP map — aborting write';
  const verifiedCount = countMarshalEvents(verification['@events']);
  if (verifiedCount !== payload.events.length) throw `Verification failed: expected ${payload.events.length} events, dump has ${verifiedCount} — aborting write`;

  // Nothing to back up when we're creating the file for the first time.
  if (exists) await fsPromises.copyFile(filePath, `${filePath}.bak`);
  await fsPromises.writeFile(filePath, dumped);
  log.info('write-rmxp-events/success');
  return { ok: true };
};

export const registerWriteRMXPEvents = defineBackendServiceFunction('write-rmxp-events', writeRMXPEvents);
