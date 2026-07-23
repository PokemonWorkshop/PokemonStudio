import type { RMXPEvent, RMXPEventPage, RMXPEventCommand, RMXPMoveCommand, RMXPMoveRoute } from '@src/backendTasks/readRMXPEvents';
import { condFromRuby, describeCond, splitComposedCond } from './conditions';

/**
 * Shared helpers for the fork's RMXP event editor (Map tab, Events mode).
 *
 * The editor works on the REAL `RPG::Event` structures inside
 * `Data/Map###.rxdata` (read via readRMXPEvents, written via
 * writeRMXPEvents + ts-marshal). This keeps events runnable by PSDK today
 * and keeps RMXP usable as a fallback editor on the same data.
 */

export type { RMXPEvent, RMXPEventPage, RMXPEventCommand, RMXPMoveCommand, RMXPMoveRoute };

// --- enums (RMXP numeric fields → labels) -----------------------------------

export const TRIGGERS = ['action_button', 'player_touch', 'event_touch', 'autorun', 'parallel_process'] as const;
export const MOVE_TYPES = ['fixed', 'random', 'approach', 'custom'] as const;
/** Index of 'custom' in MOVE_TYPES — the only type that runs the page's move route. */
export const CUSTOM_MOVE_TYPE = MOVE_TYPES.indexOf('custom');
export const MOVE_SPEEDS = ['slowest', 'slower', 'slow', 'fast', 'faster', 'fastest'] as const; // 1..6
export const MOVE_FREQS = ['lowest', 'lower', 'low', 'high', 'higher', 'highest'] as const; // 1..6
/** RMXP direction values → row index in a 4×4 character sheet. */
export const DIRECTION_TO_ROW: Record<number, number> = { 2: 0, 4: 1, 6: 2, 8: 3 };
export const DIRECTIONS = [
  { value: 2, key: 'down' },
  { value: 4, key: 'left' },
  { value: 6, key: 'right' },
  { value: 8, key: 'up' },
] as const;

// --- factories ---------------------------------------------------------------

export const createEmptyPage = (): RMXPEventPage => ({
  condition: {
    isSwitch1: false,
    isSwitch2: false,
    isVariable: false,
    isSelfSwitch: false,
    switch1Id: 1,
    switch2Id: 1,
    variableId: 1,
    variableValue: 0,
    selfSwitch: 'A',
  },
  graphic: { tileId: 0, characterName: '', characterHue: 0, direction: 2, pattern: 0, opacity: 255, blendType: 0 },
  moveType: 0,
  moveSpeed: 3,
  moveFrequency: 3,
  // RMXP defaults repeat to true on autonomous custom routes.
  moveRoute: { isRepeat: true, isSkippable: false, list: [{ code: 0, parameters: [] }] },
  isWalkAnime: true,
  isStepAnime: false,
  isDirectionFix: false,
  isThrough: false,
  isAlwaysOnTop: false,
  trigger: 0,
  // RMXP terminates every command list with a blank code-0 entry.
  list: [{ code: 0, indent: 0, parameters: [] }],
});

export const createEmptyEvent = (id: number, x: number, y: number): RMXPEvent => ({
  id,
  name: `EV${`${id}`.padStart(3, '0')}`,
  x,
  y,
  pages: [createEmptyPage()],
});

export const nextEventId = (events: RMXPEvent[]): number => Math.max(0, ...events.map((e) => e.id)) + 1;

// --- command decoding ----------------------------------------------------------
//
// Renders any RMXP command list human-readably. Codes we don't know are shown
// generically with their raw parameters — and since editing this pass never
// touches command lists, EVERYTHING round-trips untouched.

export type DecodedCommand = {
  indent: number;
  /** i18n-agnostic label, already assembled (command names are RMXP canon). */
  text: string;
  /** true for the blank "@>" terminator rows */
  blank?: boolean;
  /** csv reference detected in a Show Text command */
  csvRef?: { fileId: number; line: number };
};

const OPERATORS = ['==', '>=', '<=', '>', '<', '!='] as const;

/** RMXP facing values for Transfer Player. 0 = keep whatever way the player faces. */
const DIRECTION_LABEL: Record<number, string> = { 2: 'down', 4: 'left', 6: 'right', 8: 'up' };

/**
 * The filename out of an audio parameter. readRMXPEvents gives 132/241/245/
 * 249/250 a plain `{ name, volume, pitch }` (see buildEventParameters).
 *
 * There is deliberately NO positional fallback. This only sees a nameless value
 * when the parameter is malformed — and guessing `value[0]` there would be the
 * very bug this shape exists to kill: RPG::AudioFile's ivar order varies, so
 * slot 0 is the volume ~16% of the time, and a wrong-but-plausible filename is
 * far worse than an obviously odd one.
 */
const audioName = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  return record.name ?? record['@name'] ?? value;
};

// --- command editing helpers ---------------------------------------------------

/**
 * Codes that define the branch/indent structure of a list. Deleting or
 * inserting THESE would orphan children or corrupt indent pairing, so the
 * editor treats them as read-only anchors for now.
 */
export const STRUCTURAL_CODES = new Set([102, 402, 403, 404, 111, 411, 412, 112, 413, 301, 601, 602, 603, 604]);
/** Continuation code → the head code it belongs to. */
/**
 * Codes that are extra lines of the command above them, not commands of their
 * own. 509 is one: a Set Move Route (209) carries the whole RPG::MoveRoute in
 * its parameter, and RMXP mirrors each step as a 509 purely for its editor
 * (PSDK has no command_509). Treating them as continuations makes select,
 * delete, reorder and copy act on the route as a single unit — the same way
 * they already do for a multi-line message (101 + 401).
 */
export const CONTINUATION_OF: Record<number, number> = { 401: 101, 408: 108, 655: 355, 605: 302, 509: 209 };

/** A command plus provenance: `__keep` = index in the ORIGINAL page list (undefined = created in the editor). */
export type WorkingCommand = RMXPEventCommand & { __keep?: number };

/** A head command grouped with its continuation lines (401/408/655/605). */
export type CommandChain = { start: number; entries: WorkingCommand[] };

/** Group a list into chains so selection/deletion always moves whole logical commands. */
export const buildChains = (list: WorkingCommand[]): CommandChain[] => {
  const chains: CommandChain[] = [];
  for (let i = 0; i < list.length; i++) {
    const headCode = list[i].code;
    const entries: WorkingCommand[] = [list[i]];
    // Compare against the chain HEAD, not the previous entry — a 3-line
    // script is 355,655,655 and the second 655 must still attach to the 355.
    while (i + 1 < list.length && CONTINUATION_OF[list[i + 1].code] === headCode) {
      entries.push(list[++i]);
    }
    chains.push({ start: i - entries.length + 1, entries });
  }
  return chains;
};

// --- move routes (RPG::MoveRoute / RPG::MoveCommand) -----------------------------
//
// Verified against pokemonsdk `4 Systems/003 Map Engine/2 Logic/50 RMXP/110
// Game_Character_2.rb` (move_type_custon_exec_command) and the RMXP reference
// §16. Notes that matter:
//   * RPG::MoveCommand has NO indent — only { code, parameters }.
//   * The list terminates with a blank code-0 entry; PSDK loops back to index 0
//     from there when @repeat is on.
//   * Codes 1..14 are movement, 15 is wait, 16..26 turn, 27..45 "special".
//   * Only code 44 (Play SE) carries a rich object (RPG::AudioFile); every other
//     command's parameters are plain JSON and safe for the editor to author.

/** Shape of a move command's parameters, driving which form fields it needs. */
export type MoveCmdKind = 'none' | 'jump' | 'wait' | 'switch' | 'speed' | 'freq' | 'graphic' | 'opacity' | 'blend' | 'se' | 'script';

export type MoveCommandSpec = {
  code: number;
  /** i18n key suffix — `me_move_<key>`. */
  key: string;
  kind: MoveCmdKind;
  /** Which column of RMXP's Move Route dialog this button lives in. */
  column: 0 | 1 | 2;
};

/** The full RMXP move-command palette, laid out as RMXP's three columns. */
export const MOVE_COMMANDS: readonly MoveCommandSpec[] = [
  // Column 0 — movement
  { code: 1, key: 'move_down', kind: 'none', column: 0 },
  { code: 2, key: 'move_left', kind: 'none', column: 0 },
  { code: 3, key: 'move_right', kind: 'none', column: 0 },
  { code: 4, key: 'move_up', kind: 'none', column: 0 },
  { code: 5, key: 'move_lower_left', kind: 'none', column: 0 },
  { code: 6, key: 'move_lower_right', kind: 'none', column: 0 },
  { code: 7, key: 'move_upper_left', kind: 'none', column: 0 },
  { code: 8, key: 'move_upper_right', kind: 'none', column: 0 },
  { code: 9, key: 'move_random', kind: 'none', column: 0 },
  { code: 10, key: 'move_toward', kind: 'none', column: 0 },
  { code: 11, key: 'move_away', kind: 'none', column: 0 },
  { code: 12, key: 'step_forward', kind: 'none', column: 0 },
  { code: 13, key: 'step_backward', kind: 'none', column: 0 },
  { code: 14, key: 'jump', kind: 'jump', column: 0 },
  { code: 15, key: 'wait', kind: 'wait', column: 0 },
  // Column 1 — turning + switches/speed
  { code: 16, key: 'turn_down', kind: 'none', column: 1 },
  { code: 17, key: 'turn_left', kind: 'none', column: 1 },
  { code: 18, key: 'turn_right', kind: 'none', column: 1 },
  { code: 19, key: 'turn_up', kind: 'none', column: 1 },
  { code: 20, key: 'turn_90r', kind: 'none', column: 1 },
  { code: 21, key: 'turn_90l', kind: 'none', column: 1 },
  { code: 22, key: 'turn_180', kind: 'none', column: 1 },
  { code: 23, key: 'turn_90rl', kind: 'none', column: 1 },
  { code: 24, key: 'turn_random', kind: 'none', column: 1 },
  { code: 25, key: 'turn_toward', kind: 'none', column: 1 },
  { code: 26, key: 'turn_away', kind: 'none', column: 1 },
  { code: 27, key: 'switch_on', kind: 'switch', column: 1 },
  { code: 28, key: 'switch_off', kind: 'switch', column: 1 },
  { code: 29, key: 'speed', kind: 'speed', column: 1 },
  { code: 30, key: 'freq', kind: 'freq', column: 1 },
  // Column 2 — flags + appearance
  { code: 31, key: 'walk_anime_on', kind: 'none', column: 2 },
  { code: 32, key: 'walk_anime_off', kind: 'none', column: 2 },
  { code: 33, key: 'step_anime_on', kind: 'none', column: 2 },
  { code: 34, key: 'step_anime_off', kind: 'none', column: 2 },
  { code: 35, key: 'dirfix_on', kind: 'none', column: 2 },
  { code: 36, key: 'dirfix_off', kind: 'none', column: 2 },
  { code: 37, key: 'through_on', kind: 'none', column: 2 },
  { code: 38, key: 'through_off', kind: 'none', column: 2 },
  { code: 39, key: 'top_on', kind: 'none', column: 2 },
  { code: 40, key: 'top_off', kind: 'none', column: 2 },
  { code: 41, key: 'graphic', kind: 'graphic', column: 2 },
  { code: 42, key: 'opacity', kind: 'opacity', column: 2 },
  { code: 43, key: 'blend', kind: 'blend', column: 2 },
  { code: 44, key: 'se', kind: 'se', column: 2 },
  { code: 45, key: 'script', kind: 'script', column: 2 },
] as const;

export const MOVE_COMMAND_BY_CODE: ReadonlyMap<number, MoveCommandSpec> = new Map(MOVE_COMMANDS.map((c) => [c.code, c]));

/** A move command plus provenance (`__keep` = index in the ORIGINAL route list). */
export type WorkingMoveCommand = RMXPMoveCommand & { __keep?: number };

/** Plain-JSON stand-in for an RPG::AudioFile — the writer marshals it for code 44. */
export type MoveAudio = { name: string; volume: number; pitch: number };

/**
 * A page's own Autonomous Movement route. `@repeat` defaults ON, matching
 * RMXP's `RPG::MoveRoute#initialize` — a page route is meant to loop forever.
 */
export const createEmptyMoveRoute = (): RMXPMoveRoute => ({
  isRepeat: true,
  isSkippable: false,
  list: [{ code: 0, parameters: [] }],
});

/**
 * A FORCED route, for Set Move Route (209) — a different default from a page's.
 *
 * `@repeat` must start OFF. A repeating forced route never finishes:
 * `move_type_custom_end` only clears `@move_route_forcing` on the non-repeat
 * branch, and `waiting_event?` blocks the interpreter for as long as any
 * character is still forcing — so a repeating 209 followed by a "Wait for Move's
 * Completion" (210) hangs the game forever. RMXP's own 209 dialog defaults it
 * off too, and the real data agrees: 1821 of 1859 routes on disk have it off.
 */
export const createForcedMoveRoute = (): RMXPMoveRoute => ({
  isRepeat: false,
  isSkippable: false,
  list: [{ code: 0, parameters: [] }],
});

/**
 * Human-readable summary of one move command for the route list. `names` lets
 * switch commands show `[BicycleGet]` instead of `[12]`, matching the event list.
 */
export const decodeMoveCommand = (cmd: RMXPMoveCommand, label: (key: string) => string, names?: NameTables): string => {
  if (cmd.code === 0) return '';
  const spec = MOVE_COMMAND_BY_CODE.get(cmd.code);
  if (!spec) return `Code ${cmd.code}: ${cmd.parameters.map(asStr).join(', ')}`;
  const name = label(spec.key);
  const p = cmd.parameters;
  const swName = (id: number) => (names?.switches?.[id] ? `[${names.switches[id]}]` : `[${id}]`);
  switch (spec.kind) {
    case 'jump':
      return `${name}: ${asNum(p[0])}, ${asNum(p[1])}`;
    case 'wait':
      return `${name}: ${asNum(p[0])}`;
    case 'switch':
      return `${name}: ${swName(asNum(p[0]))}`;
    case 'speed':
    case 'freq':
    case 'opacity':
    case 'blend':
      return `${name}: ${asNum(p[0])}`;
    case 'graphic':
      return `${name}: ${asStr(p[0]) || '—'}`;
    case 'se': {
      const audio = p[0] as Record<string, unknown> | undefined;
      return `${name}: ${asStr(audio?.['@name'] ?? (audio as unknown as MoveAudio)?.name ?? '')}`;
    }
    case 'script': {
      // Fork: "Go to tile / event" are find_path(...) script steps — show them
      // as their friendly command instead of the raw Ruby.
      const goto = parseGotoScript(asStr(p[0]));
      if (goto) {
        if (goto.kind === 'tile') return `${label('goto_tile')}: (${goto.x}, ${goto.y})`;
        if (goto.kind === 'player') return label('goto_player');
        return `${label('goto_event')}: [${goto.eventId}]`;
      }
      return `${name}: ${asStr(p[0])}`;
    }
    default:
      return name;
  }
};

/**
 * Fork: parse a move-route "Go to tile / event" step — a code-45 script move
 * command whose body is a PSDK `find_path(to: …)` call. Returns null for any
 * other script (which is shown verbatim).
 */
export type GotoTarget =
  | { kind: 'tile'; x: number; y: number }
  | { kind: 'player' }
  | { kind: 'event'; eventId: number };
const GOTO_TILE_RE = /^find_path\(to:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\)$/;
const GOTO_PLAYER_RE = /^find_path\(to:\s*\$game_player\)$/;
const GOTO_EVENT_RE = /^find_path\(to:\s*\$game_map\.events\[\s*(\d+)\s*\]\)$/;
export const parseGotoScript = (script: string): GotoTarget | null => {
  const s = script.trim();
  const tile = s.match(GOTO_TILE_RE);
  if (tile) return { kind: 'tile', x: Number(tile[1]), y: Number(tile[2]) };
  if (GOTO_PLAYER_RE.test(s)) return { kind: 'player' };
  const ev = s.match(GOTO_EVENT_RE);
  if (ev) return { kind: 'event', eventId: Number(ev[1]) };
  return null;
};
/** Build the find_path script body for a Go-to target. */
export const buildGotoScript = (target: GotoTarget): string => {
  if (target.kind === 'tile') return `find_path(to: [${target.x}, ${target.y}])`;
  if (target.kind === 'player') return 'find_path(to: $game_player)';
  return `find_path(to: $game_map.events[${target.eventId}])`;
};

// --- event name tags (PSDK engine conventions) -----------------------------------
//
// PSDK's map engine parses these from the EVENT NAME:
//   '§'            → no shadow under the sprite   (Sprite_Character::SHADOW_TAG)
//   '[z=N]'        → force sprite z level         (Game_Event::SET_Z_TAG)
//   '[sprite=off]' → no sprite                    (Game_Event::NO_SPRITE_TAG)

export const SHADOWLESS_TAG = '§';
const Z_TAG_PATTERN = /\[z=(-?[0-9]+)\]/;

export const hasShadowlessTag = (name: string): boolean => name.includes(SHADOWLESS_TAG);
export const setShadowlessTag = (name: string, on: boolean): string => {
  const without = name.replaceAll(SHADOWLESS_TAG, '').replace(/^\s+/, '');
  return on ? `${SHADOWLESS_TAG} ${without}`.trimEnd() : without;
};

export const getZTag = (name: string): number | null => {
  const match = name.match(Z_TAG_PATTERN);
  return match ? Number(match[1]) : null;
};
export const setZTag = (name: string, z: number | null): string => {
  const without = name.replace(Z_TAG_PATTERN, '').replace(/\s{2,}/g, ' ').trimEnd();
  return z === null ? without : `${without} [z=${z}]`;
};

/** The user-facing name with every PSDK tag (§, [z=N]) stripped out. */
export const stripNameTags = (name: string): string =>
  name.replaceAll(SHADOWLESS_TAG, '').replace(Z_TAG_PATTERN, '').replace(/\s{2,}/g, ' ').trim();

/**
 * Rebuild the stored event name from the user-facing (tag-free) name plus the
 * hidden PSDK flags. Keeps § as a prefix and [z=N] as a suffix — the layout
 * PSDK's regexes expect — so tags stay invisible in the Name field yet still
 * round-trip to the rxdata.
 */
export const composeEventName = (visible: string, shadowless: boolean, z: number | null): string => {
  let name = visible.trim();
  if (shadowless) name = `${SHADOWLESS_TAG} ${name}`.trim();
  if (z !== null) name = `${name} [z=${z}]`.trim();
  return name;
};

export const isChainEditable = (chain: CommandChain): boolean => {
  const code = chain.entries[0].code;
  // 204 = Change Map Settings — Panorama (0) / Fog (1) / Battleback (2) all have
  // editable forms now; any other target stays read-only.
  if (code === 204) {
    const target = Number(chain.entries[0].parameters[0]);
    return target === 0 || target === 1 || target === 2;
  }
  return (
    code === 101 || code === 108 || code === 355 || code === 106 || code === 121 || code === 123 || code === 122 || code === 118 || code === 119 ||
    // 209 owns its 509 continuation lines, so editing it rewrites the chain.
    code === 209 || code === 210 ||
    // Transfer Player / Call Common Event — plain scalars, no rich params.
    code === 201 || code === 117 ||
    // Show / Move / Erase Picture — scalars + a filename string, no rich params.
    code === 231 || code === 232 || code === 235 ||
    // Quick scalar/no-param commands.
    code === 208 || code === 116 || code === 125 || code === 354 ||
    code === 203 || code === 225 || code === 221 || code === 222 || code === 135 ||
    // Weather / fog-opacity / event-location / timer / number & button input /
    // save & encounter access / exit / rotate picture — plain scalar params.
    code === 236 || code === 206 || code === 202 || code === 124 || code === 103 ||
    code === 105 || code === 134 || code === 136 || code === 115 || code === 233 ||
    // Scene calls / text options / windowskin — no-param or plain scalars.
    code === 353 || code === 351 || code === 352 || code === 104 || code === 131 ||
    // Screen/Fog/Picture Color Tone + Screen Flash. Safe only because
    // readRMXPEvents decodes their Tone/Color buffer BY KEY into a plain object
    // and writeRMXPEvents packs an identical buffer back (buildRichColor).
    code === 223 || code === 205 || code === 234 || code === 224 ||
    // Audio. Only safe because readRMXPEvents reads their RPG::AudioFile BY KEY
    // and writeRMXPEvents marshals one back — authoring these while the reader
    // still flattened them positionally would have written a plain Ruby Array.
    code === 241 || code === 245 || code === 249 || code === 250 || code === 132 || code === 133 ||
    code === 242 || code === 246 || code === 247 || code === 248 || code === 251
  );
};

// --- branch/loop structure (choices, conditionals, loops) -----------------------
//
// A "block opener" starts a nested structure whose body is at indent+1 and which
// ends with a matching closer at the SAME indent. RMXP indent rules: the closer
// (404/412/413) and the intermediate markers (402/403/411) sit at the opener's
// indent; the body they wrap sits one level deeper.

export const BLOCK_OPENERS: ReadonlySet<number> = new Set([102, 111, 112]); // Show Choices / Conditional Branch / Loop
export const CLOSER_OF: Record<number, number> = { 102: 404, 111: 412, 112: 413 };
/** Codes after which "Insert" nests a command as the block's first child (indent+1). */
export const INSERT_OPENERS = new Set([102, 402, 403, 111, 411, 112]);

/**
 * Nothing may sit between a Show Choices (102) and its first When (402).
 *
 * RMXP has no slot there: `command_102` immediately hands control to a branch,
 * so a stranded command runs for EVERY choice rather than none. When an insert
 * would land in that gap, step past the marker so it lands INSIDE the first
 * branch instead — the same dodge `relocateChain` makes for a drag.
 */
export const avoidChoicesGap = (list: WorkingCommand[], index: number): boolean => list[index - 1]?.code === 102;

/**
 * Span [start, end) of the whole block opened at `start`. Matches the closer at
 * the same indent, so nested blocks (which reuse 412/404/413 at deeper indents)
 * don't terminate the outer one early. Non-openers span just themselves.
 */
export const blockSpan = (list: WorkingCommand[], start: number): { start: number; end: number } => {
  const opener = list[start];
  const closer = CLOSER_OF[opener.code];
  if (closer === undefined) return { start, end: start + 1 };
  for (let i = start + 1; i < list.length; i++) {
    if (list[i].code === closer && list[i].indent === opener.indent) return { start, end: i + 1 };
  }
  return { start, end: list.length };
};

/** Labels (code 118) defined in a command list — for the Jump-to-Label picker. */
export const collectLabels = (list: WorkingCommand[]): string[] => {
  const labels: string[] = [];
  for (const cmd of list) {
    if (cmd.code === 118) {
      const name = typeof cmd.parameters[0] === 'string' ? cmd.parameters[0] : String(cmd.parameters[0] ?? '');
      if (name && !labels.includes(name)) labels.push(name);
    }
  }
  return labels;
};

/** Deletable as a unit: plain commands AND block openers (their whole block goes). */
export const isChainDeletable = (chain: CommandChain): boolean => {
  const code = chain.entries[0].code;
  if (code === 0) return false;
  if (BLOCK_OPENERS.has(code)) return true;
  return !STRUCTURAL_CODES.has(code);
};

/** Reorderable by drag/arrows: only plain, non-structural commands (never blocks). */
export const isChainReorderable = (chain: CommandChain): boolean => {
  const code = chain.entries[0].code;
  return code !== 0 && !STRUCTURAL_CODES.has(code);
};

/** Build a text-carrying chain (101/401, 108/408, 355/655) from multi-line text. */
export const buildTextChain = (headCode: 101 | 108 | 355, text: string, indent: number): WorkingCommand[] => {
  const contCode = headCode === 101 ? 401 : headCode === 108 ? 408 : 655;
  const lines = text.split('\n');
  return lines.map((line, i) => ({ code: i === 0 ? headCode : contCode, indent, parameters: [line] }));
};

// --- pretty rendering -----------------------------------------------------------

/** Comparison operators available in ENHANCED page conditions (int values match the PSDK patch). */
export const CONDITION_OPERATORS = ['==', '>=', '<=', '>', '<'] as const;

export type PrettyKind = 'blank' | 'normal' | 'comment' | 'script' | 'cont';
export type PrettyCommand = DecodedCommand & { kind: PrettyKind; label: string; body: string };

/** Split a decoded command into a colored label + body for clean list rendering. */
export const decodeCommandPretty = (
  cmd: RMXPEventCommand,
  resolveCsv?: (fileId: number, line: number) => string | undefined,
  names?: NameTables,
  moveLabel?: (key: string) => string,
): PrettyCommand => {
  const decoded = decodeCommand(cmd, resolveCsv, names, moveLabel);
  const kind: PrettyKind =
    cmd.code === 0 ? 'blank'
    : cmd.code === 108 || cmd.code === 408 ? 'comment'
    : cmd.code === 355 || cmd.code === 655 ? 'script'
    : // A move-route step reads as a continuation of the Set Move Route above it.
      cmd.code === 401 || cmd.code === 509 ? 'cont'
    : 'normal';
  if (kind === 'blank') return { ...decoded, kind, label: '', body: '' };
  // 509's body is the decoded step, not a raw parameter string.
  if (cmd.code === 509) return { ...decoded, kind, label: '', body: decoded.text };
  if (kind === 'cont' || cmd.code === 408 || cmd.code === 655) {
    return { ...decoded, kind, label: '', body: String(cmd.parameters[0] ?? '') };
  }
  if (cmd.code === 108) return { ...decoded, kind, label: 'Comment', body: String(cmd.parameters[0] ?? '') };
  if (cmd.code === 355) return { ...decoded, kind, label: 'Script', body: String(cmd.parameters[0] ?? '') };
  const sep = decoded.text.indexOf(': ');
  if (sep === -1) return { ...decoded, kind, label: decoded.text, body: '' };
  return { ...decoded, kind, label: decoded.text.slice(0, sep), body: decoded.text.slice(sep + 2) };
};

// Tiny Ruby tokenizer for script syntax highlighting — no dependency, good
// enough for event-sized snippets.
export type RubyToken = { text: string; type: 'kw' | 'str' | 'sym' | 'num' | 'com' | 'const' | 'gvar' | 'plain' };

const RUBY_KEYWORDS = new Set([
  'def', 'end', 'if', 'elsif', 'else', 'unless', 'while', 'until', 'do', 'then', 'return', 'next', 'break',
  'true', 'false', 'nil', 'self', 'case', 'when', 'and', 'or', 'not', 'class', 'module', 'begin', 'rescue', 'yield',
]);

const RUBY_TOKEN_PATTERN = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(:[A-Za-z_][A-Za-z0-9_]*[?!]?)|(\$[A-Za-z_][A-Za-z0-9_]*)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_][A-Za-z0-9_]*[?!]?)/gm;

export const tokenizeRuby = (code: string): RubyToken[] => {
  const tokens: RubyToken[] = [];
  let last = 0;
  for (const match of code.matchAll(RUBY_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: code.slice(last, index), type: 'plain' });
    const [full, com, str, sym, gvar, num, konst, ident] = match;
    if (com) tokens.push({ text: com, type: 'com' });
    else if (str) tokens.push({ text: str, type: 'str' });
    else if (sym) tokens.push({ text: sym, type: 'sym' });
    else if (gvar) tokens.push({ text: gvar, type: 'gvar' });
    else if (num) tokens.push({ text: num, type: 'num' });
    else if (konst) tokens.push({ text: konst, type: 'const' });
    else if (ident) tokens.push({ text: ident, type: RUBY_KEYWORDS.has(ident) ? 'kw' : 'plain' });
    else tokens.push({ text: full, type: 'plain' });
    last = index + full.length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last), type: 'plain' });
  return tokens;
};
const asStr = (v: unknown): string => (typeof v === 'string' ? v : JSON.stringify(v));
const asNum = (v: unknown): number => (typeof v === 'number' ? v : 0);

/** PSDK convention: a Show Text whose body is "300004, 39" pulls CSV file 300004 line 39. */
const CSV_REF_PATTERN = /^\s*(\d{4,6})\s*,\s*(\d+)\s*$/;

export type NameTables = {
  switches?: string[];
  variables?: string[];
  /** map id -> name, for Transfer Player. */
  maps?: Record<number, string>;
  /** common event id -> name, for Call Common Event. */
  commonEvents?: Record<number, string>;
};

/**
 * One step of a Set Move Route, as it reaches the renderer. readRMXPEvents gives
 * 509 a real `{ code, parameters }` (see buildEventParameters); the array form is
 * the older flattened `[code, params]`, kept only so a stale payload still reads.
 */
const moveCommandFromParam = (value: unknown): RMXPMoveCommand | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.code !== 'number') return null;
    return { code: record.code, parameters: Array.isArray(record.parameters) ? record.parameters : [] };
  }
  if (!Array.isArray(value) || typeof value[0] !== 'number') return null;
  return { code: value[0], parameters: Array.isArray(value[1]) ? value[1] : [] };
};

export const decodeCommand = (
  cmd: RMXPEventCommand,
  resolveCsv?: (fileId: number, line: number) => string | undefined,
  names?: NameTables,
  moveLabel?: (key: string) => string,
): DecodedCommand => {
  const p = cmd.parameters;
  // `indent` here is for DISPLAY only — it never flows back into the file.
  // A move-route step (509) is stored at the same indent as its 209, but RMXP
  // shows it nested under it, so nest it here too. Writing this indent to disk
  // would be a real data change; nothing does.
  const base = { indent: cmd.indent + (cmd.code === 509 ? 1 : 0) };
  const swName = (id: number) => (names?.switches?.[id] ? `[${names.switches[id]}]` : `[${id}]`);
  const varName = (id: number) => (names?.variables?.[id] ? `[${names.variables[id]}]` : `[${id}]`);
  // readRMXPEvents decodes a Tone/Color param to { red, green, blue, gray|alpha }.
  // Show the four channels; older data flattened to a byte array reads as '?'.
  const toneStr = (v: unknown, fourth: 'gray' | 'alpha'): string => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return '?';
    const t = v as Record<string, unknown>;
    return `${asNum(t.red)}, ${asNum(t.green)}, ${asNum(t.blue)}, ${asNum(t[fourth])}`;
  };
  switch (cmd.code) {
    case 0:
      return { ...base, text: '', blank: true };
    case 101: {
      const text = asStr(p[0]);
      const m = text.match(CSV_REF_PATTERN);
      if (m) {
        const fileId = Number(m[1]);
        const line = Number(m[2]);
        const resolved = resolveCsv?.(fileId, line);
        return { ...base, text: `Text: ${resolved ? `"${resolved}"` : text} (CSV ${fileId}, ${line})`, csvRef: { fileId, line } };
      }
      return { ...base, text: `Text: ${text}` };
    }
    case 401:
      return { ...base, text: `      ${asStr(p[0])}` };
    case 102: {
      const choices = Array.isArray(p[0]) ? (p[0] as unknown[]).map(asStr) : [];
      return { ...base, text: `Show Choices: ${choices.join(' / ')}` };
    }
    case 402:
      return { ...base, text: `When [${asStr(p[1])}]` };
    case 403:
      return { ...base, text: 'When Cancel' };
    case 404:
      return { ...base, text: 'Choices End' };
    case 103:
      return { ...base, text: `Input Number: variable [${asNum(p[0])}], ${asNum(p[1])} digit(s)` };
    case 106:
      // One stored unit is 2 real frames = 1/30s (PSDK doubles it), so show
      // the wall-clock duration alongside the raw frame count.
      return { ...base, text: `Wait: ${asNum(p[0])} frame(s) (${(Number(p[0] ?? 0) / 30).toFixed(2)}s)` };
    case 108:
      return { ...base, text: `Comment: ${asStr(p[0])}` };
    case 408:
      return { ...base, text: `       : ${asStr(p[0])}` };
    case 111: {
      // Conditional branch — decode the common subtypes.
      const kind = asNum(p[0]);
      if (kind === 0) return { ...base, text: `Conditional Branch: Switch ${swName(asNum(p[1]))} is ${asNum(p[2]) === 0 ? 'ON' : 'OFF'}` };
      if (kind === 1) {
        const operandIsVar = asNum(p[2]) === 1;
        const operand = operandIsVar ? `Variable ${varName(asNum(p[3]))}` : `${asNum(p[3])}`;
        return { ...base, text: `Conditional Branch: Variable ${varName(asNum(p[1]))} ${OPERATORS[asNum(p[4])] ?? '=='} ${operand}` };
      }
      if (kind === 2) return { ...base, text: `Conditional Branch: Self Switch "${asStr(p[1])}" is ${asNum(p[2]) === 0 ? 'ON' : 'OFF'}` };
      if (kind === 12) {
        // A multi-condition branch is authored as one script conditional. Show it
        // as the conditions the user actually entered — with switch/variable names
        // — rather than the composed Ruby. Anything hand-written doesn't split and
        // falls through to being shown verbatim, which is what it is.
        const expr = asStr(p[1]);
        const composed = splitComposedCond(expr);
        if (composed) {
          const joiner = composed.join === 'or' ? ' OR ' : ' AND ';
          const text = composed.parts.map((part) => describeCond(condFromRuby(part), swName, varName)).join(joiner);
          return { ...base, text: `Conditional Branch: ${text}` };
        }
        return { ...base, text: `Conditional Branch: Script: ${expr}` };
      }
      return { ...base, text: `Conditional Branch (type ${kind}): ${p.slice(1).map(asStr).join(', ')}` };
    }
    case 411:
      return { ...base, text: 'Else' };
    case 412:
      return { ...base, text: 'Branch End' };
    case 112:
      return { ...base, text: 'Loop' };
    case 413:
      return { ...base, text: 'Repeat Above' };
    case 113:
      return { ...base, text: 'Break Loop' };
    case 115:
      return { ...base, text: 'Exit Event Processing' };
    case 301:
      // command_301 -> $data_troops[@parameters[0]]; [1] can escape, [2] can lose.
      return {
        ...base,
        text: `Battle Processing: Troop [${asNum(p[0])}]${asNum(p[1]) ? ', can escape' : ''}${asNum(p[2]) ? ', can continue if lose' : ''}`,
      };
    case 601:
      return { ...base, text: 'If Win' };
    case 602:
      return { ...base, text: 'If Escape' };
    case 603:
      return { ...base, text: 'If Lose' };
    case 604:
      return { ...base, text: 'Battle Processing: End' };
    case 116:
      return { ...base, text: 'Erase Event' };
    case 117: {
      const id = asNum(p[0]);
      const name = names?.commonEvents?.[id];
      return { ...base, text: `Call Common Event: ${name ? `[${id}: ${name}]` : `[${id}]`}` };
    }
    case 118:
      return { ...base, text: `Label: ${asStr(p[0])}` };
    case 119:
      return { ...base, text: `Jump to Label: ${asStr(p[0])}` };
    case 121: {
      const first = asNum(p[0]);
      const last = asNum(p[1]);
      const range = first === last ? swName(first) : `[${first}..${last}]`;
      return { ...base, text: `Control Switches: ${range} = ${asNum(p[2]) === 0 ? 'ON' : 'OFF'}` };
    }
    case 122: {
      const first = asNum(p[0]);
      const last = asNum(p[1]);
      const range = first === last ? varName(first) : `[${first}..${last}]`;
      const op = ['=', '+=', '-=', '*=', '/=', '%='][asNum(p[2])] ?? '=';
      const operandType = asNum(p[3]);
      const operand =
        operandType === 0 ? `${asNum(p[4])}`
        : operandType === 1 ? `Variable [${asNum(p[4])}]`
        : operandType === 2 ? `Random(${asNum(p[4])}..${asNum(p[5])})`
        : `…`;
      return { ...base, text: `Control Variables: ${range} ${op} ${operand}` };
    }
    case 123:
      return { ...base, text: `Control Self Switch: "${asStr(p[0])}" = ${asNum(p[1]) === 0 ? 'ON' : 'OFF'}` };
    case 125:
      return { ...base, text: `Change Gold: ${asNum(p[0]) === 0 ? '+' : '-'}${asNum(p[1]) === 0 ? asNum(p[2]) : `Variable [${asNum(p[2])}]`}` };
    case 126:
      return { ...base, text: `Change Items: [${asNum(p[0])}] ${asNum(p[1]) === 0 ? '+' : '-'}${asNum(p[2]) === 0 ? asNum(p[3]) : `Variable [${asNum(p[3])}]`}` };
    case 201: {
      // [appointMethod, mapId|varId, x|varId, y|varId, direction, fade]
      const direct = asNum(p[0]) === 0;
      const facing = DIRECTION_LABEL[asNum(p[4])];
      const suffix = `${facing ? `, facing ${facing}` : ''}${asNum(p[5]) === 1 ? ', no fade' : ''}`;
      if (!direct) return { ...base, text: `Transfer Player: variables ${varName(asNum(p[1]))}, ${varName(asNum(p[2]))}, ${varName(asNum(p[3]))}${suffix}` };
      const id = asNum(p[1]);
      const mapName = names?.maps?.[id];
      return { ...base, text: `Transfer Player: ${mapName ? `[${id}: ${mapName}]` : `Map ${id}`} (${asNum(p[2])}, ${asNum(p[3])})${suffix}` };
    }
    case 202:
      return { ...base, text: `Set Event Location: event [${asNum(p[0])}]` };
    case 203:
      return { ...base, text: `Scroll Map: dir ${asNum(p[0])}, ${asNum(p[1])} tile(s), speed ${asNum(p[2])}` };
    case 207:
      return { ...base, text: `Show Animation: event [${asNum(p[0])}], animation [${asNum(p[1])}]` };
    case 208:
      // command_208: transparent = (parameters[0] == 0). 0 = ON (transparent).
      return { ...base, text: `Change Transparent Flag: ${asNum(p[0]) === 0 ? 'ON' : 'OFF'}` };
    case 209:
      return { ...base, text: `Set Move Route: ${asNum(p[0]) === -1 ? 'Player' : asNum(p[0]) === 0 ? 'This event' : `Event [${asNum(p[0])}]`}` };
    case 509: {
      // One step of the Set Move Route above. Rendered like a 401/655
      // continuation, but each 509 is its own command in the list.
      const move = moveCommandFromParam(p[0]);
      if (!move) return { ...base, text: `$> ${p.map(asStr).join(', ')}` };
      const spec = MOVE_COMMAND_BY_CODE.get(move.code);
      const label = moveLabel ?? ((key: string) => key);
      return { ...base, text: `$> ${spec ? decodeMoveCommand(move, label, names) : `Code ${move.code}: ${move.parameters.map(asStr).join(', ')}`}` };
    }
    case 210:
      return { ...base, text: "Wait for Move's Completion" };
    case 204: {
      // command_204 -> @parameters[0] selects what changes; [1] is the name.
      const target = ['Panorama', 'Fog', 'Battleback'][asNum(p[0])] ?? `type ${asNum(p[0])}`;
      const name = asStr(p[1]);
      // Fog carries opacity at [3], blend at [4], and (fork extension) a static
      // offset at [8]/[9]. Surface them so the list reads at a glance.
      if (asNum(p[0]) === 1) {
        const blend = ['', ', add', ', subtract', ', multiply'][asNum(p[4])] ?? '';
        const ox = asNum(p[8]);
        const oy = asNum(p[9]);
        const off = ox || oy ? `, offset (${ox}, ${oy})` : '';
        return { ...base, text: `Change Fog: ${name ? `"${name}"` : '(none)'}, opacity ${asNum(p[3])}${blend}${off}` };
      }
      return { ...base, text: `Change Map Settings: ${target}${name ? ` "${name}"` : ''}` };
    }
    case 205:
      // command_205 -> $game_map.start_fog_tone_change(@parameters[0], @parameters[1] * 2)
      return { ...base, text: `Change Fog Color Tone: (${toneStr(p[0], 'gray')}) over ${asNum(p[1])} frame(s)` };
    case 221:
      // command_221 -> Graphics.freeze. No parameters.
      return { ...base, text: 'Prepare for Transition' };
    case 222:
      // The param is a transition graphic name; empty = the default fade.
      return { ...base, text: `Execute Transition${asStr(p[0]) ? `: "${asStr(p[0])}"` : ''}` };
    case 223:
      return { ...base, text: `Change Screen Color Tone: (${toneStr(p[0], 'gray')}) over ${asNum(p[1])} frame(s)` };
    case 224:
      return { ...base, text: `Screen Flash: (${toneStr(p[0], 'alpha')}) over ${asNum(p[1])} frame(s)` };
    case 225:
      return { ...base, text: `Screen Shake: power ${asNum(p[0])}, speed ${asNum(p[1])}, ${asNum(p[2])} frame(s)` };
    case 231: {
      // [number, name, origin, appoint, x, y, zoomX, zoomY, opacity, blend]
      const at = asNum(p[3]) === 1 ? `(${varName(asNum(p[4]))}, ${varName(asNum(p[5]))})` : `(${asNum(p[4])}, ${asNum(p[5])})`;
      return { ...base, text: `Show Picture: [${asNum(p[0])}] "${asStr(p[1])}" at ${at}` };
    }
    case 232: {
      // [number, duration, origin, appoint, x, y, zoomX, zoomY, opacity, blend].
      // The frame count is stored raw (PSDK doubles it at runtime) — show what
      // RMXP shows, the raw value, not the doubled one.
      const at = asNum(p[3]) === 1 ? `(${varName(asNum(p[4]))}, ${varName(asNum(p[5]))})` : `(${asNum(p[4])}, ${asNum(p[5])})`;
      return { ...base, text: `Move Picture: [${asNum(p[0])}] to ${at} over ${asNum(p[1])} frame(s)` };
    }
    case 233:
      return { ...base, text: `Rotate Picture: [${asNum(p[0])}], speed ${asNum(p[1])}` };
    case 234:
      // command_234 -> start_tone_change(@parameters[1], @parameters[2] * 2). Show
      // the RAW frame count RMXP stores (matches 223/225/232), not the doubled one.
      return { ...base, text: `Change Picture Color Tone: [${asNum(p[0])}] (${toneStr(p[1], 'gray')}) over ${asNum(p[2])} frame(s)` };
    case 235:
      return { ...base, text: `Erase Picture: [${asNum(p[0])}]` };
    case 236: {
      // PSDK visual weather (902 Overworld Weather.rb): 0 None … 5 Fog.
      const wt = ['None', 'Rain', 'Sun', 'Sandstorm', 'Hail', 'Fog'][asNum(p[0])] ?? `type ${asNum(p[0])}`;
      return { ...base, text: `Set Weather: ${wt}, power ${asNum(p[1])} over ${asNum(p[2])} frame(s)` };
    }
    case 206:
      // command_206 -> start_fog_opacity_change(opacity, duration * 2).
      return { ...base, text: `Change Fog Opacity: ${asNum(p[0])} over ${asNum(p[1])} frame(s)` };
    case 241:
      return { ...base, text: `Play BGM: "${asStr(audioName(p[0]))}"` };
    case 242:
      // command_242 -> $game_system.bgm_fade(@parameters[0]); the param is seconds.
      return { ...base, text: `Fade Out BGM: ${asNum(p[0])} second(s)` };
    case 245:
      return { ...base, text: `Play BGS: "${asStr(audioName(p[0]))}"` };
    case 246:
      return { ...base, text: `Fade Out BGS: ${asNum(p[0])} second(s)` };
    case 247:
      return { ...base, text: 'Memorize BGM/BGS' };
    case 248:
      return { ...base, text: 'Restore BGM/BGS' };
    case 251:
      return { ...base, text: 'Stop SE' };
    case 249:
      return { ...base, text: `Play ME: "${asStr(audioName(p[0]))}"` };
    case 250:
      return { ...base, text: `Play SE: "${asStr(audioName(p[0]))}"` };
    case 132:
      return { ...base, text: `Change Battle BGM: "${asStr(audioName(p[0]))}"` };
    case 135:
      // command_135: menu_disabled = (parameters[0] == 0). 0 = disable, 1 = enable.
      return { ...base, text: `Change Menu Access: ${asNum(p[0]) === 0 ? 'Disable' : 'Enable'}` };
    case 134:
      return { ...base, text: `Change Save Access: ${asNum(p[0]) === 0 ? 'Disable' : 'Enable'}` };
    case 136:
      return { ...base, text: `Change Encounter: ${asNum(p[0]) === 0 ? 'Disable' : 'Enable'}` };
    case 124:
      // command_124: [0 start (seconds), 1 stop].
      return { ...base, text: asNum(p[0]) === 0 ? `Control Timer: Start ${asNum(p[1])}s` : 'Control Timer: Stop' };
    case 105:
      return { ...base, text: `Button Input Processing: variable [${asNum(p[0])}]` };
    case 303:
      // command_303 -> name input for $data_actors[@parameters[0]].
      return { ...base, text: `Name Input Processing: Actor [${asNum(p[0])}], ${asNum(p[1])} character(s)` };
    case 322:
      // command_322 -> actor.set_graphic(character_name, character_hue, battler_name, battler_hue)
      return { ...base, text: `Change Actor Graphic: Actor [${asNum(p[0])}], "${asStr(p[1])}"` };
    case 351:
      return { ...base, text: 'Call Menu Screen' };
    case 352:
      return { ...base, text: 'Call Save Screen' };
    case 353:
      return { ...base, text: 'Game Over' };
    case 104:
      return { ...base, text: `Change Text Options: ${['top', 'middle', 'bottom'][asNum(p[0])] ?? asNum(p[0])}, ${asNum(p[1]) === 0 ? 'normal' : 'dim'}` };
    case 131:
      return { ...base, text: `Change Windowskin: "${asStr(p[0])}"` };
    case 133:
      return { ...base, text: `Change Battle End ME: "${asStr(audioName(p[0]))}"` };
    case 354:
      return { ...base, text: 'Return to Title Screen' };
    case 355:
      return { ...base, text: `Script: ${asStr(p[0])}` };
    case 655:
      return { ...base, text: `      : ${asStr(p[0])}` };
    default:
      return { ...base, text: `Code ${cmd.code}: ${p.map(asStr).join(', ')}` };
  }
};
