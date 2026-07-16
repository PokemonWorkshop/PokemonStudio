import { buildTextChain, createForcedMoveRoute, type RMXPMoveRoute, type WorkingCommand } from '../rmxpEventUtils';
import { condParams, condsFromParams, emptyCond, isCondUsable, type CondEntry, type CondJoin } from '../conditions';

export { emptyCond, isCondUsable, VAR_OPS, type CondEntry } from '../conditions';

/**
 * The command-editor form model: the `CmdForm` shape plus every pure function
 * that turns a form into RMXP/PSDK command(s) or reads a command back into a
 * form. No React here — this is the logic the CommandForm UI and the dialog
 * shell both build on.
 */

export type CmdFormKind =
  | 'text' | 'comment' | 'script' | 'wait' | 'switch' | 'selfSwitch' | 'variable'
  | 'choices' | 'conditional' | 'loop' | 'break' | 'label' | 'jump'
  | 'creature' | 'item' | 'moveRoute' | 'waitMove'
  | 'playBgm' | 'playBgs' | 'playMe' | 'playSe' | 'battleBgm'
  | 'fadeBgm' | 'fadeBgs' | 'stopSe' | 'memorizeBgm' | 'restoreBgm'
  | 'transfer' | 'commonEvent'
  | 'showPicture' | 'movePicture' | 'erasePicture'
  | 'tintScreen' | 'fogTone' | 'pictureTone' | 'screenFlash'
  | 'transparent' | 'eraseEvent' | 'changeGold' | 'returnToTitle'
  | 'scrollMap' | 'screenShake' | 'prepareTransition' | 'executeTransition' | 'menuAccess';

/** Audio-playing kinds → their RMXP code and the Audio/ folder to browse. */
export const AUDIO_KINDS: Record<string, { code: number; folder: string }> = {
  playBgm: { code: 241, folder: 'bgm' },
  playBgs: { code: 245, folder: 'bgs' },
  playMe: { code: 249, folder: 'me' },
  playSe: { code: 250, folder: 'se' },
  battleBgm: { code: 132, folder: 'bgm' },
};

/** PSDK stat order for IV/EV arrays: [hp, atk, dfe, spd, ats, dfs]. */
export const STAT_KEYS = ['hp', 'atk', 'dfe', 'spd', 'ats', 'dfs'] as const;

/** One Show-Choices option: a literal string or a PSDK CSV reference. */
export type ChoiceEntry = { mode: 'raw' | 'csv'; text: string; csvFile: number; csvLine: number };
export const emptyChoice = (): ChoiceEntry => ({ mode: 'raw', text: '', csvFile: 300004, csvLine: 0 });
/** The string stored in the 402 params — literal, or the "file, line" CSV ref. */
export const choiceText = (c: ChoiceEntry): string => (c.mode === 'csv' ? `${c.csvFile}, ${c.csvLine}` : c.text.trim());

export type CmdForm = {
  kind: CmdFormKind;
  mode: 'insert' | 'edit';
  text: string;
  amount: number;
  id: number;
  key: string;
  state: number; // 0 = ON / first option
  op: number;
  /** Text command source: literal string or a PSDK CSV reference. */
  textMode: 'raw' | 'csv';
  csvFile: number;
  csvLine: number;
  // Show Choices
  choices: ChoiceEntry[];
  cancelType: number; // 0 = disallow, 1..4 = choice index, 5 = branch
  /**
   * Transfer Player (201). `transferByVariable` is RMXP's "appoint method":
   * when on, mapId/x/y are VARIABLE IDS to read at runtime rather than literals.
   */
  transferByVariable: boolean;
  transferMapId: number;
  transferX: number;
  transferY: number;
  /** 0 = keep facing, else 2/4/6/8. */
  transferDirection: number;
  /** RMXP calls this "Fade": 0 = fade, 1 = none. */
  transferFade: number;
  // Call Common Event (117)
  commonEventId: number;
  /**
   * Pictures (231 Show / 232 Move / 235 Erase). Verified vs command_231/232 in
   * `028 Interpreter_5.rb`: origin 0 = top-left, 1 = centre; blend 0/1/2. Show &
   * Move share every field; Move adds `picDuration` (frames) and drops the file.
   * `picByVariable` on = X/Y are variable ids read at runtime.
   */
  picNumber: number; // 1..50
  picName: string; // '__undef__' = none; bare name, no extension
  picOrigin: number; // 0 top-left, 1 centre
  picByVariable: boolean;
  picX: number;
  picY: number;
  picZoomX: number; // percent, 100 = 1x
  picZoomY: number;
  picOpacity: number; // 0..255
  picBlend: number; // 0 normal, 1 add, 2 sub
  picDuration: number; // Move Picture only, in frames
  // Change Gold (125): operate_value(operation, operandType, operand).
  goldOp: number; // 0 increase, 1 decrease
  goldByVariable: boolean;
  goldValue: number;
  // Scroll Map (203)
  scrollDir: number; // 2/4/6/8
  scrollDistance: number;
  scrollSpeed: number; // 1..6
  // Screen Shake (225). Duration stored raw (PSDK doubles at runtime).
  shakePower: number;
  shakeSpeed: number;
  shakeDuration: number;
  /**
   * Screen/Fog/Picture Color Tone (223 / 205 / 234) and Screen Flash (224).
   * All four store four channels as doubles; for a Tone the 4th is "gray"
   * (-255..255 on RGB, 0..255 on gray — but we don't hard-clamp: a stronger
   * tone is a legitimate "better RMXP" reach), for a Flash Color it's "alpha"
   * (flash strength, 0..255). `toneDuration` is the RAW frame count RMXP stores
   * (PSDK doubles it at runtime, like the pictures and the shake).
   * 234 also reuses `picNumber` for its target picture.
   */
  toneRed: number;
  toneGreen: number;
  toneBlue: number;
  toneGray: number;
  toneDuration: number;
  // Audio (Play BGM/BGS/ME/SE, Change Battle BGM)
  audioName: string;
  audioVolume: number;
  audioPitch: number;
  // Set Move Route (209): who moves, and the route itself.
  moveTarget: number; // -1 = Player, 0 = This event, >0 = event id
  moveRoute: RMXPMoveRoute;
  /**
   * Wait for Move's Completion (210). PSDK expands RMXP's "wait for everything"
   * with a per-character wait (`wait_character_move_completion`): when `waitAll`
   * is off, it waits for just one character — `waitTarget` -1 = this event
   * (the method's default), 0 = the player, >0 = a specific event.
   */
  waitAll: boolean;
  waitTarget: number;
  // Conditional Branch
  conds: CondEntry[];
  /** How multiple conditions combine. One join for the whole branch — no mixing. */
  condJoin: CondJoin;
  condElse: boolean;
  // Add Item (PSDK interpreter helpers → script command)
  itemMode: 'add' | 'pick' | 'give';
  itemSymbol: string;
  count: number;
  deleteEvent: boolean; // add/pick: delete this event after the item is taken
  // Add Creature (PSDK add_pokemon / add_specific_pokemon → script command)
  species: string;
  nickname: string;
  level: number;
  shiny: boolean;
  nature: string;
  moves: string[];
  evs: number[];
  ivs: number[];
  customEvs: boolean;
  customIvs: boolean;
};

/**
 * A CSV-backed text is stored as the bare string "file, line". Detecting one on
 * the way back in is a heuristic, so callers should pass `isCsvFile` (backed by
 * the project's loaded texts): "300004, 39" is a CSV reference when file 300004
 * really exists, and a literal otherwise. Without the check we fall back to the
 * id-shape guess, which is all we can do.
 */
const CSV_TEXT_PATTERN = /^\s*(\d+)\s*,\s*(\d+)\s*$/;
export type IsCsvFile = (fileId: number) => boolean;

const csvRefOf = (text: string, isCsvFile?: IsCsvFile): { fileId: number; line: number } | null => {
  const match = text.match(CSV_TEXT_PATTERN);
  if (!match) return null;
  const fileId = Number(match[1]);
  const looksLikeCsv = isCsvFile ? isCsvFile(fileId) : /^\d{4,6}$/.test(match[1]);
  return looksLikeCsv ? { fileId, line: Number(match[2]) } : null;
};

const FORM_KIND_BY_CODE: Record<number, CmdFormKind> = {
  101: 'text', 108: 'comment', 355: 'script', 106: 'wait', 121: 'switch', 123: 'selfSwitch', 122: 'variable', 118: 'label', 119: 'jump',
  209: 'moveRoute', 210: 'waitMove',
  201: 'transfer', 117: 'commonEvent',
  231: 'showPicture', 232: 'movePicture', 235: 'erasePicture',
  223: 'tintScreen', 205: 'fogTone', 234: 'pictureTone', 224: 'screenFlash',
  208: 'transparent', 116: 'eraseEvent', 125: 'changeGold', 354: 'returnToTitle',
  203: 'scrollMap', 225: 'screenShake', 221: 'prepareTransition', 222: 'executeTransition', 135: 'menuAccess',
  241: 'playBgm', 245: 'playBgs', 249: 'playMe', 250: 'playSe', 132: 'battleBgm',
  242: 'fadeBgm', 246: 'fadeBgs', 251: 'stopSe', 247: 'memorizeBgm', 248: 'restoreBgm',
  // NOT 102/111: those edit their whole BLOCK, not a single chain, so they go
  // through choicesFormFromBlock / conditionalFormFromBlock instead. Routing
  // them through formFromChain would hand the decoder just the opener — with no
  // Else marker and no branch bodies to see.
};

export const emptyForm = (kind: CmdFormKind, mode: 'insert' | 'edit'): CmdForm => ({
  // `amount` is shared: frames for a Wait, seconds for a fade (min 1 — see
  // buildCommandsFromForm), a plain value elsewhere.
  kind, mode, text: '', amount: kind === 'wait' ? 20 : kind === 'fadeBgm' || kind === 'fadeBgs' ? 1 : 0,
  id: 1, key: 'A', state: 0, op: 0,
  textMode: 'raw', csvFile: 300004, csvLine: 0,
  // RMXP shows four choice slots by default; blank ones are dropped on build.
  choices: [emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()], cancelType: 0,
  // -1 (Player) is by far the most common target in real maps.
  transferByVariable: false, transferMapId: 0, transferX: 0, transferY: 0, transferDirection: 0, transferFade: 0,
  commonEventId: 0,
  picNumber: 1, picName: '__undef__', picOrigin: 0, picByVariable: false, picX: 0, picY: 0,
  picZoomX: 100, picZoomY: 100, picOpacity: 255, picBlend: 0, picDuration: 20,
  goldOp: 0, goldByVariable: false, goldValue: 0,
  scrollDir: 2, scrollDistance: 1, scrollSpeed: 4,
  shakePower: 5, shakeSpeed: 5, shakeDuration: 20,
  // A neutral (all-zero) tone over 20 frames — RMXP's "clear tint" default.
  toneRed: 0, toneGreen: 0, toneBlue: 0, toneGray: 0, toneDuration: 20,
  // RMXP's audio defaults: full volume, normal pitch.
  audioName: '__undef__', audioVolume: 100, audioPitch: 100,
  // A FORCED route: @repeat off, or a following 210 waits forever. See createForcedMoveRoute.
  moveTarget: -1, moveRoute: createForcedMoveRoute(),
  waitAll: true, waitTarget: -1,
  conds: [emptyCond()], condJoin: 'and', condElse: false,
  itemMode: 'add', itemSymbol: '__undef__', count: 1, deleteEvent: true,
  species: '__undef__', nickname: '', level: 5, shiny: false, nature: '__undef__',
  moves: ['__undef__', '__undef__', '__undef__', '__undef__'],
  evs: [0, 0, 0, 0, 0, 0], ivs: [31, 31, 31, 31, 31, 31], customEvs: false, customIvs: false,
});

export const buildCommandsFromForm = (form: CmdForm, indent: number): WorkingCommand[] => {
  switch (form.kind) {
    case 'text':
      if (form.textMode === 'csv') return buildTextChain(101, `${form.csvFile}, ${form.csvLine}`, indent);
      return buildTextChain(101, form.text, indent);
    case 'comment':
      return buildTextChain(108, form.text, indent);
    case 'script':
      return buildTextChain(355, form.text, indent);
    case 'wait':
      return [{ code: 106, indent, parameters: [Math.max(1, form.amount)] }];
    case 'switch':
      return [{ code: 121, indent, parameters: [form.id, form.id, form.state] }];
    case 'selfSwitch':
      return [{ code: 123, indent, parameters: [form.key || 'A', form.state] }];
    case 'variable':
      return [{ code: 122, indent, parameters: [form.id, form.id, form.op, 0, form.amount] }];
    case 'choices': {
      // 102 head + one 402 "When" per choice (+403 When Cancel if branch) + 404.
      // Bodies start empty — the user selects a "When" row and inserts inside it.
      // Each choice string is either a literal or a "file, line" CSV reference.
      const texts = form.choices.map(choiceText).filter((c) => c.length > 0);
      const list: WorkingCommand[] = [{ code: 102, indent, parameters: [texts, form.cancelType] }];
      texts.forEach((text, i) => list.push({ code: 402, indent, parameters: [i, text] }));
      if (form.cancelType === 5) list.push({ code: 403, indent, parameters: [] });
      list.push({ code: 404, indent, parameters: [] });
      return list;
    }
    case 'conditional': {
      const params = condParams(form.conds, form.condJoin);
      const list: WorkingCommand[] = [{ code: 111, indent, parameters: params }];
      if (form.condElse) list.push({ code: 411, indent, parameters: [] });
      list.push({ code: 412, indent, parameters: [] });
      return list;
    }
    case 'transfer':
      // command_201: [appointMethod, mapId|varId, x|varId, y|varId, direction, fade]
      return [
        {
          code: 201,
          indent,
          parameters: [
            form.transferByVariable ? 1 : 0,
            form.transferMapId,
            form.transferX,
            form.transferY,
            form.transferDirection,
            form.transferFade,
          ],
        },
      ];
    case 'commonEvent':
      return [{ code: 117, indent, parameters: [form.commonEventId] }];
    case 'showPicture':
      // command_231: [number, name, origin, appoint, x, y, zoomX, zoomY, opacity, blend]
      return [{ code: 231, indent, parameters: [form.picNumber, form.picName === '__undef__' ? '' : form.picName, ...pictureTail(form)] }];
    case 'movePicture':
      // command_232: [number, duration, origin, appoint, x, y, zoomX, zoomY, opacity, blend]
      // (PSDK doubles the duration at runtime; the STORED value is RMXP's frame count.)
      return [{ code: 232, indent, parameters: [form.picNumber, Math.max(0, form.picDuration), ...pictureTail(form)] }];
    case 'erasePicture':
      return [{ code: 235, indent, parameters: [form.picNumber] }];
    case 'tintScreen':
      // command_223: [Tone, duration]. Duration stored raw (PSDK doubles it).
      return [{ code: 223, indent, parameters: [toneObj(form), Math.max(0, form.toneDuration)] }];
    case 'fogTone':
      // command_205: [Tone, duration].
      return [{ code: 205, indent, parameters: [toneObj(form), Math.max(0, form.toneDuration)] }];
    case 'pictureTone':
      // command_234: [pictureNumber, Tone, duration].
      return [{ code: 234, indent, parameters: [form.picNumber, toneObj(form), Math.max(0, form.toneDuration)] }];
    case 'screenFlash':
      // command_224: [Color, duration]. The 4th channel is flash strength (alpha).
      return [{ code: 224, indent, parameters: [colorObj(form), Math.max(0, form.toneDuration)] }];
    case 'transparent':
      // command_208: transparent = (parameters[0] == 0). 0 = ON, 1 = OFF.
      return [{ code: 208, indent, parameters: [form.state] }];
    case 'eraseEvent':
      return [{ code: 116, indent, parameters: [] }];
    case 'changeGold':
      // command_125: operate_value(operation, operandType, operand).
      return [{ code: 125, indent, parameters: [form.goldOp, form.goldByVariable ? 1 : 0, form.goldValue] }];
    case 'returnToTitle':
      return [{ code: 354, indent, parameters: [] }];
    case 'scrollMap':
      return [{ code: 203, indent, parameters: [form.scrollDir, Math.max(0, form.scrollDistance), clamp(form.scrollSpeed, 1, 6)] }];
    case 'screenShake':
      // Duration stored raw (PSDK doubles it at runtime), like the pictures.
      return [{ code: 225, indent, parameters: [form.shakePower, form.shakeSpeed, Math.max(0, form.shakeDuration)] }];
    case 'prepareTransition':
      return [{ code: 221, indent, parameters: [] }];
    case 'executeTransition':
      // parameters[0] is a transition graphic name; empty = the default fade.
      return [{ code: 222, indent, parameters: [form.text] }];
    case 'menuAccess':
      // command_135: menu_disabled = (parameters[0] == 0). 0 = disable, 1 = enable.
      return [{ code: 135, indent, parameters: [form.state] }];
    case 'moveRoute':
      return buildMoveRouteChain(form, indent);
    case 'waitMove':
      // "All" is RMXP's native command; a single character is PSDK's script call.
      if (form.waitAll) return [{ code: 210, indent, parameters: [] }];
      return buildTextChain(355, waitScript(form.waitTarget), indent);
    case 'playBgm':
    case 'playBgs':
    case 'playMe':
    case 'playSe':
    case 'battleBgm':
      // The writer marshals this plain object into a real RPG::AudioFile.
      return [
        {
          code: AUDIO_KINDS[form.kind].code,
          indent,
          parameters: [{ name: form.audioName === '__undef__' ? '' : form.audioName, volume: form.audioVolume, pitch: form.audioPitch }],
        },
      ];
    // A 0-second fade is an instant cut, not a fade — PSDK's bgm_fade(0) just
    // stops the channel. RMXP's dialog has a 1-second minimum and every fade in
    // the real project data is 1..10, so hold that floor.
    case 'fadeBgm':
      return [{ code: 242, indent, parameters: [Math.max(1, form.amount)] }];
    case 'fadeBgs':
      return [{ code: 246, indent, parameters: [Math.max(1, form.amount)] }];
    case 'stopSe':
      return [{ code: 251, indent, parameters: [] }];
    case 'memorizeBgm':
      return [{ code: 247, indent, parameters: [] }];
    case 'restoreBgm':
      return [{ code: 248, indent, parameters: [] }];
    case 'loop':
      return [
        { code: 112, indent, parameters: [] },
        { code: 413, indent, parameters: [] },
      ];
    case 'break':
      return [{ code: 113, indent, parameters: [] }];
    case 'label':
      return [{ code: 118, indent, parameters: [form.text.trim()] }];
    case 'jump':
      return [{ code: 119, indent, parameters: [form.text.trim()] }];
    case 'item':
      return buildTextChain(355, buildItemScript(form), indent);
    case 'creature':
      return buildTextChain(355, buildCreatureScript(form), indent);
  }
};

/**
 * A Set Move Route (209) and its 509 mirror lines.
 *
 * Verified against all 1344 Set Move Routes in the real project data:
 *   * 209's parameter holds the WHOLE route, terminator included.
 *   * There is one 509 per step, EXCLUDING that trailing code-0 terminator.
 *   * Every 509 sits at the 209's own indent (1344/1344).
 * PSDK never runs the 509s (there is no command_509 — command_209 reads the
 * route from its own parameter); they exist so RMXP's editor can show the steps.
 */
export const buildMoveRouteChain = (form: CmdForm, indent: number): WorkingCommand[] => {
  const steps = form.moveRoute.list.filter((cmd) => cmd.code !== 0);
  const route: RMXPMoveRoute = {
    isRepeat: form.moveRoute.isRepeat,
    isSkippable: form.moveRoute.isSkippable,
    list: [...steps, { code: 0, parameters: [] }],
  };
  return [
    { code: 209, indent, parameters: [form.moveTarget, route] },
    ...steps.map((cmd) => ({ code: 509, indent, parameters: [cmd] })),
  ];
};

/**
 * The parameters shared by Show (231) and Move (232) Picture, after their
 * differing 2nd slot (name vs duration): origin, appoint method, x, y, zoomX,
 * zoomY, opacity, blend. In variable mode x/y are variable ids.
 */
const pictureTail = (form: CmdForm): number[] => [
  form.picOrigin,
  form.picByVariable ? 1 : 0,
  form.picX,
  form.picY,
  form.picZoomX,
  form.picZoomY,
  form.picOpacity,
  form.picBlend,
];

/**
 * The plain tone/color object writeRMXPEvents packs back into a user-marshal
 * buffer. A Tone's 4th channel is "gray"; a Flash Color's is "alpha" — same four
 * form fields, different key so the writer packs the right class.
 */
const toneObj = (form: CmdForm) => ({ red: form.toneRed, green: form.toneGreen, blue: form.toneBlue, gray: form.toneGray });
const colorObj = (form: CmdForm) => ({ red: form.toneRed, green: form.toneGreen, blue: form.toneBlue, alpha: form.toneGray });

/**
 * The PSDK script for a per-character move wait. `wait_character_move_completion`
 * defaults its arg to the calling event, so "this event" passes none; the player
 * is id 0; any other event is its id.
 */
const waitScript = (target: number): string =>
  target < 0 ? 'wait_character_move_completion' : `wait_character_move_completion(${target})`;

/** Inverse of `waitScript` — reopens a matching Script command as a waitMove form. */
const WAIT_RE = /^wait_character_move_completion(?:\((\d+)\))?$/;
const waitFormFromScript = (script: string): CmdForm | null => {
  const m = script.match(WAIT_RE);
  if (!m) return null;
  const form = emptyForm('waitMove', 'edit');
  form.waitAll = false;
  form.waitTarget = m[1] === undefined ? -1 : Number(m[1]);
  return form;
};

/** Ruby single-quoted string literal with the minimal escaping. */
const rubyStr = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
export const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

/**
 * PSDK interpreter call for the three item helpers (add/pick/give). `no_delete`
 * is only passed when the user unchecks "Delete event" (add_item/pick_item
 * default to deleting); give_item never deletes and has no such parameter.
 */
const buildItemScript = (form: CmdForm): string => {
  const sym = `:${form.itemSymbol}`;
  const n = Math.max(1, form.count);
  const noDelete = !form.deleteEvent;
  if (form.itemMode === 'give') return `give_item(${sym}, ${n})`;
  if (form.itemMode === 'pick') return noDelete ? `pick_item(${sym}, ${n}, true)` : `pick_item(${sym}, ${n})`;
  return noDelete ? `add_item(${sym}, true, count: ${n})` : `add_item(${sym}, count: ${n})`;
};

/**
 * PSDK add_pokemon / add_specific_pokemon call. Falls back to the terse
 * add_pokemon form when nothing beyond species/level/shiny is customized.
 */
const buildCreatureScript = (form: CmdForm): string => {
  const moves = form.moves.filter((m) => m && m !== '__undef__');
  const hasNature = !!form.nature && form.nature !== '__undef__';
  const customized = form.nickname.trim() !== '' || hasNature || moves.length > 0 || form.customIvs || form.customEvs;
  if (!customized) return `add_pokemon(:${form.species}, ${form.level}${form.shiny ? ', true' : ''})`;

  const parts = [`id: :${form.species}`, `level: ${form.level}`];
  if (form.shiny) parts.push('shiny: true');
  if (form.nickname.trim()) parts.push(`given_name: ${rubyStr(form.nickname.trim())}`);
  if (hasNature) parts.push(`nature: :${form.nature}`);
  if (moves.length > 0) parts.push(`moves: [${moves.map((m) => `:${m}`).join(', ')}]`);
  if (form.customIvs) parts.push(`stats: [${form.ivs.join(', ')}]`);
  if (form.customEvs) parts.push(`bonus: [${form.evs.join(', ')}]`);
  return `add_specific_pokemon({ ${parts.join(', ')} })`;
};

/** Kinds whose single parameter is an audio file. */
export const isAudioKind = (kind: CmdFormKind): boolean => kind in AUDIO_KINDS;

/** Whether the form has enough input to build a valid command. */
export const canSubmitForm = (f: CmdForm): boolean => {
  // An audio command with no file would write an empty RPG::AudioFile name,
  // which plays nothing — make the user pick one.
  if (isAudioKind(f.kind)) return f.audioName !== '__undef__';
  // In variable mode all three slots are VARIABLE IDS, and $game_variables[0]
  // silently returns 0 rather than erroring — so a half-filled transfer would
  // quietly send the player to map 0. Require all three.
  if (f.kind === 'transfer') {
    if (f.transferByVariable) return f.transferMapId > 0 && f.transferX > 0 && f.transferY > 0;
    // Direct mode: map 0 is not a real map, but (0, 0) is a legitimate tile.
    return f.transferMapId > 0;
  }
  // $data_common_events[0] is nil, so command_117 would silently do nothing.
  if (f.kind === 'commonEvent') return f.commonEventId > 0;
  // Show Picture with no file draws nothing. Move/Erase just act on a number.
  if (f.kind === 'showPicture') return f.picName !== '__undef__';
  if (f.kind === 'label' || f.kind === 'jump') return f.text.trim().length > 0;
  if (f.kind === 'choices') return f.choices.some((c) => choiceText(c).length > 0);
  if (f.kind === 'item') return f.itemSymbol !== '__undef__';
  if (f.kind === 'creature') return f.species !== '__undef__';
  // A branch needs at least one condition that can actually be built — an empty
  // script test contributes nothing and would silently vanish from the join.
  if (f.kind === 'conditional') return f.conds.some(isCondUsable);
  return true;
};

/**
 * Read a Conditional Branch (111) back into a form. `block` is the full span
 * from the 111 through its matching 412 (see blockSpan) — NOT the command
 * chain. The chain holds only the 111 head (a 111 has no continuation lines),
 * so the Else marker isn't in it and `condElse` would always read false.
 *
 * The condition decoding is shared with the command-list decoder (see
 * ../conditions); the only thing the form adds is whether there's an Else.
 * Returns null for a subtype the editor can't author.
 */
export const conditionalFormFromBlock = (block: WorkingCommand[]): CmdForm | null => {
  const head = block[0];
  const decoded = condsFromParams(head.parameters);
  if (!decoded) return null;
  const form = emptyForm('conditional', 'edit');
  form.conds = decoded.conds;
  form.condJoin = decoded.join;
  // Only a 411 at the OPENER's indent is this branch's Else; a deeper one
  // belongs to a nested branch.
  form.condElse = block.some((e) => e.code === 411 && e.indent === head.indent);
  return form;
};

/**
 * Read an existing Show Choices block (102 + its 402/403 markers) back into a
 * pre-filled `choices` form. `block` is the full span from the 102 through its
 * matching 404 (see blockSpan). Choice text that looks like a PSDK CSV
 * reference ("file, line") comes back as a CSV entry.
 */
export const choicesFormFromBlock = (block: WorkingCommand[], isCsvFile?: IsCsvFile): CmdForm => {
  const form = emptyForm('choices', 'edit');
  const head = block[0];
  form.cancelType = Number(head.parameters[1]) || 0;
  const indent = head.indent;
  const choices: ChoiceEntry[] = [];
  for (const cmd of block) {
    // Only markers at the block's own indent — nested blocks reuse these codes.
    if (cmd.code !== 402 || cmd.indent !== indent) continue;
    const text = String(cmd.parameters[1] ?? '');
    const csv = csvRefOf(text, isCsvFile);
    if (csv) choices.push({ mode: 'csv', text: '', csvFile: csv.fileId, csvLine: csv.line });
    else choices.push({ mode: 'raw', text, csvFile: 300004, csvLine: 0 });
  }
  form.choices = choices.length > 0 ? choices : [emptyChoice()];
  return form;
};

/**
 * Rebuild a Show Choices block from an edited form while KEEPING the commands
 * already written inside each branch. Bodies are re-attached by position, so
 * renaming choices keeps their contents; a removed choice drops its body and a
 * new choice starts empty. Preserved commands keep their `__keep` provenance,
 * so they still round-trip byte-faithfully on save.
 */
export const rebuildChoicesBlock = (form: CmdForm, block: WorkingCommand[]): WorkingCommand[] => {
  const indent = block[0].indent;
  // Split the old block into the body that follows each marker.
  const whenBodies: WorkingCommand[][] = [];
  let cancelBody: WorkingCommand[] = [];
  let current: WorkingCommand[] | null = null;
  let currentIsCancel = false;
  const flush = () => {
    if (!current) return;
    if (currentIsCancel) cancelBody = current;
    else whenBodies.push(current);
  };
  for (let i = 1; i < block.length; i++) {
    const cmd = block[i];
    const isMarker = cmd.indent === indent && (cmd.code === 402 || cmd.code === 403 || cmd.code === 404);
    if (!isMarker) {
      current?.push(cmd);
      continue;
    }
    flush();
    current = cmd.code === 404 ? null : [];
    currentIsCancel = cmd.code === 403;
  }
  flush();

  const texts = form.choices.map(choiceText).filter((c) => c.length > 0);
  const out: WorkingCommand[] = [{ code: 102, indent, parameters: [texts, form.cancelType] }];
  texts.forEach((text, i) => {
    out.push({ code: 402, indent, parameters: [i, text] });
    out.push(...(whenBodies[i] ?? []));
  });
  if (form.cancelType === 5) {
    out.push({ code: 403, indent, parameters: [] });
    out.push(...cancelBody);
  }
  out.push({ code: 404, indent, parameters: [] });
  return out;
};

/**
 * Rewrite an existing Conditional Branch in place. `block` is the full span from
 * the 111 through its matching 412 (see blockSpan).
 *
 * Only the head's condition and the presence of the Else marker change — both
 * branch bodies are carried over untouched. Rebuilding the block from the form
 * alone would throw the bodies away, and splicing just the head would leave the
 * old 411/412 stranded.
 *
 * Turning Else OFF would orphan whatever is in the else body, so those commands
 * are appended to the "then" body rather than silently deleted — the user can
 * see them and remove them deliberately.
 */
export const rebuildConditionalBlock = (form: CmdForm, block: WorkingCommand[]): WorkingCommand[] => {
  const indent = block[0].indent;
  const thenBody: WorkingCommand[] = [];
  const elseBody: WorkingCommand[] = [];
  let inElse = false;
  for (let i = 1; i < block.length; i++) {
    const cmd = block[i];
    // Only markers at the BLOCK's own indent belong to it; deeper ones are a
    // nested branch's and must stay in the body.
    if (cmd.indent === indent && cmd.code === 411) {
      inElse = true;
      continue;
    }
    if (cmd.indent === indent && cmd.code === 412) continue;
    (inElse ? elseBody : thenBody).push(cmd);
  }

  const out: WorkingCommand[] = [{ code: 111, indent, parameters: condParams(form.conds, form.condJoin) }];
  out.push(...thenBody);
  if (form.condElse) {
    out.push({ code: 411, indent, parameters: [] });
    out.push(...elseBody);
  } else {
    out.push(...elseBody);
  }
  out.push({ code: 412, indent, parameters: [] });
  return out;
};

// --- reading Add Item / Add Creature back out of their script command ----------
//
// Both are stored as plain PSDK script calls (code 355) so they run in-game and
// stay editable in RMXP. Rather than tagging them with extra data (which RMXP
// would strip on re-save), we recognise the exact call shapes `buildItemScript`
// and `buildCreatureScript` emit and rebuild the structured form from them —
// anything we don't recognise simply stays a raw script. A hand-written call in
// the same shape gets the structured editor for free.

const ITEM_ADD_RE = /^add_item\(:(\w+)(?:,\s*(true))?\s*,\s*count:\s*(\d+)\)$/;
const ITEM_PICK_RE = /^pick_item\(:(\w+),\s*(\d+)(?:,\s*(true))?\)$/;
const ITEM_GIVE_RE = /^give_item\(:(\w+),\s*(\d+)\)$/;
const CREATURE_SIMPLE_RE = /^add_pokemon\(:(\w+),\s*(\d+)(?:,\s*(true))?\)$/;
const CREATURE_SPECIFIC_RE = /^add_specific_pokemon\(\{([\s\S]*)\}\)$/;

/** Inverse of `rubyStr` for the single-quoted literals we emit. */
const unRubyStr = (s: string): string => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

const itemFormFromScript = (script: string): CmdForm | null => {
  const add = script.match(ITEM_ADD_RE);
  if (add) {
    const form = emptyForm('item', 'edit');
    form.itemMode = 'add';
    form.itemSymbol = add[1];
    form.deleteEvent = add[2] !== 'true'; // the bare `true` is PSDK's no_delete
    form.count = Number(add[3]);
    return form;
  }
  const pick = script.match(ITEM_PICK_RE);
  if (pick) {
    const form = emptyForm('item', 'edit');
    form.itemMode = 'pick';
    form.itemSymbol = pick[1];
    form.count = Number(pick[2]);
    form.deleteEvent = pick[3] !== 'true';
    return form;
  }
  const give = script.match(ITEM_GIVE_RE);
  if (give) {
    const form = emptyForm('item', 'edit');
    form.itemMode = 'give';
    form.itemSymbol = give[1];
    form.count = Number(give[2]);
    return form;
  }
  return null;
};

const numberList = (raw: string): number[] | null => {
  const nums = raw.split(',').map((n) => Number(n.trim()));
  return nums.length === 6 && nums.every((n) => Number.isFinite(n)) ? nums : null;
};

const creatureFormFromScript = (script: string): CmdForm | null => {
  const simple = script.match(CREATURE_SIMPLE_RE);
  if (simple) {
    const form = emptyForm('creature', 'edit');
    form.species = simple[1];
    form.level = Number(simple[2]);
    form.shiny = simple[3] === 'true';
    return form;
  }
  const specific = script.match(CREATURE_SPECIFIC_RE);
  if (!specific) return null;
  const body = specific[1];
  const id = body.match(/(?:^|,)\s*id:\s*:(\w+)/);
  if (!id) return null; // species is mandatory — without it this isn't our shape

  const form = emptyForm('creature', 'edit');
  form.species = id[1];
  const level = body.match(/(?:^|,)\s*level:\s*(\d+)/);
  if (level) form.level = Number(level[1]);
  form.shiny = /(?:^|,)\s*shiny:\s*true/.test(body);
  const nickname = body.match(/(?:^|,)\s*given_name:\s*'((?:[^'\\]|\\.)*)'/);
  if (nickname) form.nickname = unRubyStr(nickname[1]);
  const nature = body.match(/(?:^|,)\s*nature:\s*:(\w+)/);
  if (nature) form.nature = nature[1];
  const moves = body.match(/(?:^|,)\s*moves:\s*\[([^\]]*)\]/);
  if (moves) {
    // Blank slots aren't emitted, so the list packs from Move 1 onward.
    const picked = moves[1]
      .split(',')
      .map((m) => m.trim().replace(/^:/, ''))
      .filter(Boolean);
    form.moves = form.moves.map((_, i) => picked[i] ?? '__undef__');
  }
  const stats = body.match(/(?:^|,)\s*stats:\s*\[([^\]]*)\]/);
  const ivs = stats && numberList(stats[1]);
  if (ivs) {
    form.ivs = ivs;
    form.customIvs = true;
  }
  const bonus = body.match(/(?:^|,)\s*bonus:\s*\[([^\]]*)\]/);
  const evs = bonus && numberList(bonus[1]);
  if (evs) {
    form.evs = evs;
    form.customEvs = true;
  }
  return form;
};

/** A script command that's really an Add Item / Add Creature, or null. */
const structuredScriptForm = (script: string): CmdForm | null => {
  const trimmed = script.trim();
  return itemFormFromScript(trimmed) ?? creatureFormFromScript(trimmed) ?? waitFormFromScript(trimmed);
};

export const formFromChain = (chain: { entries: WorkingCommand[] }, isCsvFile?: IsCsvFile): CmdForm | null => {
  const head = chain.entries[0];
  const kind = FORM_KIND_BY_CODE[head.code];
  if (!kind) return null;
  const form = emptyForm(kind, 'edit');
  const p = head.parameters;
  if (kind === 'text' || kind === 'comment' || kind === 'script') {
    form.text = chain.entries.map((e) => String(e.parameters[0] ?? '')).join('\n');
    if (kind === 'script') {
      // Add Item / Add Creature live as script calls — reopen their real form.
      const structured = structuredScriptForm(form.text);
      if (structured) return structured;
    }
    if (kind === 'text') {
      // Reopen a CSV-backed message in CSV mode rather than as a literal.
      const csv = csvRefOf(form.text, isCsvFile);
      if (csv) {
        form.textMode = 'csv';
        form.csvFile = csv.fileId;
        form.csvLine = csv.line;
        form.text = '';
      }
    }
  } else if (kind === 'wait') {
    form.amount = Number(p[0]) || 1;
  } else if (kind === 'switch') {
    form.id = Number(p[0]) || 1;
    form.state = Number(p[2]) || 0;
  } else if (kind === 'selfSwitch') {
    form.key = String(p[0] ?? 'A');
    form.state = Number(p[1]) || 0;
  } else if (kind === 'variable') {
    form.id = Number(p[0]) || 1;
    form.op = Number(p[2]) || 0;
    form.amount = Number(p[4]) || 0;
  } else if (kind === 'label' || kind === 'jump') {
    form.text = String(p[0] ?? '');
  } else if (kind === 'transfer') {
    form.transferByVariable = Number(p[0]) === 1;
    form.transferMapId = Number(p[1]) || 0;
    form.transferX = Number(p[2]) || 0;
    form.transferY = Number(p[3]) || 0;
    form.transferDirection = Number(p[4]) || 0;
    form.transferFade = Number(p[5]) || 0;
  } else if (kind === 'commonEvent') {
    form.commonEventId = Number(p[0]) || 0;
  } else if (kind === 'showPicture' || kind === 'movePicture') {
    // Preserve the ACTUAL stored value; only fall back when it's missing.
    // `Number(x) || d` is wrong here because a real 0 (a zoom of 0%, on disk)
    // would be replaced by the default.
    const num = (v: unknown, d: number): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };
    form.picNumber = num(p[0], 1);
    if (kind === 'showPicture') form.picName = typeof p[1] === 'string' && p[1] ? p[1] : '__undef__';
    else form.picDuration = num(p[1], 0);
    form.picOrigin = num(p[2], 0);
    form.picByVariable = Number(p[3]) === 1;
    form.picX = num(p[4], 0);
    form.picY = num(p[5], 0);
    form.picZoomX = num(p[6], 100);
    form.picZoomY = num(p[7], 100);
    form.picOpacity = num(p[8], 255);
    form.picBlend = num(p[9], 0);
  } else if (kind === 'erasePicture') {
    // Same NaN-aware read as 231/232 — never let a real 0 become 1.
    const n = Number(p[0]);
    form.picNumber = Number.isFinite(n) ? n : 1;
  } else if (kind === 'tintScreen' || kind === 'fogTone' || kind === 'pictureTone' || kind === 'screenFlash') {
    // readRMXPEvents decodes the Tone/Color buffer to a plain object; the tone
    // sits at [1] for a picture tone (its [0] is the number), else at [0].
    // Never read a real 0 as "missing" — a zeroed channel is a valid tone.
    const num = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const toneAt = kind === 'pictureTone' ? p[1] : p[0];
    const t = (toneAt && typeof toneAt === 'object' ? toneAt : {}) as Record<string, unknown>;
    form.toneRed = num(t.red);
    form.toneGreen = num(t.green);
    form.toneBlue = num(t.blue);
    // A Tone's 4th channel is "gray"; a Flash Color's is "alpha".
    form.toneGray = num(kind === 'screenFlash' ? t.alpha : t.gray);
    const durRaw = kind === 'pictureTone' ? p[2] : p[1];
    const dur = Number(durRaw);
    form.toneDuration = Number.isFinite(dur) ? dur : 20;
    if (kind === 'pictureTone') {
      const n = Number(p[0]);
      form.picNumber = Number.isFinite(n) ? n : 1;
    }
  } else if (kind === 'transparent' || kind === 'menuAccess') {
    form.state = Number(p[0]) || 0;
  } else if (kind === 'changeGold') {
    form.goldOp = Number(p[0]) || 0;
    form.goldByVariable = Number(p[1]) === 1;
    form.goldValue = Number(p[2]) || 0;
  } else if (kind === 'scrollMap') {
    form.scrollDir = Number(p[0]) || 2;
    form.scrollDistance = Number(p[1]) || 0;
    form.scrollSpeed = Number(p[2]) || 4;
  } else if (kind === 'screenShake') {
    form.shakePower = Number(p[0]) || 0;
    form.shakeSpeed = Number(p[1]) || 0;
    form.shakeDuration = Number(p[2]) || 0;
  } else if (kind === 'executeTransition') {
    form.text = String(p[0] ?? '');
  } else if (isAudioKind(kind)) {
    // readRMXPEvents gives these a plain { name, volume, pitch } — never read
    // positionally, because RPG::AudioFile's ivar order varies on disk.
    const audio = (p[0] && typeof p[0] === 'object' ? p[0] : {}) as Record<string, unknown>;
    form.audioName = typeof audio.name === 'string' && audio.name ? audio.name : '__undef__';
    form.audioVolume = typeof audio.volume === 'number' ? audio.volume : 100;
    form.audioPitch = typeof audio.pitch === 'number' ? audio.pitch : 100;
  } else if (kind === 'fadeBgm' || kind === 'fadeBgs') {
    form.amount = Number(p[0]) || 0;
  } else if (kind === 'moveRoute') {
    // readRMXPEvents gives 209 a real RMXPMoveRoute (see buildEventParameters);
    // it is never read positionally, because Ruby's ivar order varies.
    form.moveTarget = Number(p[0]) || 0;
    const route = p[1];
    form.moveRoute = isMoveRoute(route) ? { ...route, list: route.list.map((c) => ({ ...c })) } : createForcedMoveRoute();
  }
  return form;
};

const isMoveRoute = (value: unknown): value is RMXPMoveRoute =>
  !!value && typeof value === 'object' && Array.isArray((value as RMXPMoveRoute).list);
