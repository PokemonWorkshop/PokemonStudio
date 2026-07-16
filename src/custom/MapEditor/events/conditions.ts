/**
 * The Conditional Branch (111) condition codec.
 *
 * RMXP's 111 holds exactly ONE condition. To support several, we author a native
 * SCRIPT conditional (`[12, expr]`) whose Ruby expression joins the individual
 * tests with `&&` / `||`. Composing into one 111 — rather than nesting several —
 * is what keeps Else meaningful: nested branches would give each condition its
 * own Else, which isn't what "if A and B, else …" means.
 *
 * Everything here mirrors PSDK's own `Interpreter#command_111`
 * (`pokemonsdk/scripts/1 RMXP Scripts/026 Interpreter_3.rb:96-198`), which is
 * also why the codec lives here rather than in the dialog: it's engine
 * knowledge, and both the form and the command-list decoder need it.
 */

/** One condition test. `type` follows RMXP's own subtype codes. */
export type CondEntry = {
  type: number; // 0 switch, 1 variable, 2 self switch, 12 script
  id: number; // switch id / variable id
  state: number; // 0 = ON, 1 = OFF
  key: string; // self-switch letter
  operandType: number; // variable branch: 0 = constant, 1 = variable
  amount: number; // variable branch: the constant, or the id of the variable compared against
  op: number; // variable branch: index into VAR_OPS
  text: string; // script source
};

export const emptyCond = (): CondEntry => ({ type: 0, id: 1, state: 0, key: 'A', operandType: 0, amount: 0, op: 0, text: '' });

/** Variable-branch operators, indexed by RMXP's operator code (verified against command_111). */
export const VAR_OPS = ['==', '>=', '<=', '>', '<', '!='] as const;

export type CondJoin = 'and' | 'or';

/** A script test with no source can't be built; everything else always can. */
export const isCondUsable = (c: CondEntry): boolean => c.type !== 12 || c.text.trim().length > 0;

const escapeRubyStr = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** The Ruby key for a self switch, exactly as command_111's subtype 2 builds it. */
const selfSwitchKey = (key: string) => `[$game_map.map_id, @event_id, '${escapeRubyStr(key || 'A')}']`;

/**
 * The Ruby test for one condition — what command_111 does natively for each
 * subtype, expressed as source so several can be combined.
 */
export const condRuby = (c: CondEntry): string => {
  switch (c.type) {
    case 0:
      // Compare explicitly rather than testing truthiness: Game_Switches is an
      // Array, so an out-of-range id reads as nil, and `!nil` is TRUE where
      // command_111's own `$game_switches[id] == false` is false.
      return `$game_switches[${c.id}] == ${c.state === 0 ? 'true' : 'false'}`;
    case 2:
      // command_111 reads the LIVE $game_map.map_id (not the interpreter's
      // @map_id), and compares against `true` explicitly because
      // Game_SelfSwitches returns nil — not false — for a slot never set.
      return `$game_self_switches[${selfSwitchKey(c.key)}] ${c.state === 0 ? '==' : '!='} true`;
    case 12:
      return c.text.trim();
    case 1:
    default: {
      const rhs = c.operandType === 1 ? `$game_variables[${c.amount}]` : String(c.amount);
      return `$game_variables[${c.id}] ${VAR_OPS[c.op] ?? '=='} ${rhs}`;
    }
  }
};

/**
 * The composed expression for several conditions. Each test is parenthesised
 * before joining: a raw script test may itself contain `||`, which would
 * otherwise out-bind the `&&` joining it to the rest.
 */
export const composeCondRuby = (conds: CondEntry[], join: CondJoin): string =>
  conds.map((c) => `(${condRuby(c)})`).join(join === 'or' ? ' || ' : ' && ');

const SWITCH_RE = /^\$game_switches\[(\d+)\]\s*==\s*(true|false)$/;
const SELF_SWITCH_RE = /^\$game_self_switches\[\[\$game_map\.map_id,\s*@event_id,\s*'(.*)'\]\]\s*(==|!=)\s*true$/;
const VARIABLE_RE = /^\$game_variables\[(\d+)\]\s*(==|>=|<=|>|<|!=)\s*(?:\$game_variables\[(\d+)\]|(-?\d+))$/;

/** Inverse of `condRuby` for the shapes we author. Anything else stays a script test. */
export const condFromRuby = (src: string): CondEntry => {
  const text = src.trim();
  const cond = emptyCond();

  const sw = text.match(SWITCH_RE);
  if (sw) return { ...cond, type: 0, id: Number(sw[1]), state: sw[2] === 'true' ? 0 : 1 };

  const self = text.match(SELF_SWITCH_RE);
  if (self) return { ...cond, type: 2, key: self[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'), state: self[2] === '==' ? 0 : 1 };

  const v = text.match(VARIABLE_RE);
  if (v) {
    const op = VAR_OPS.indexOf(v[2] as (typeof VAR_OPS)[number]);
    const fromVar = v[3] !== undefined;
    return { ...cond, type: 1, id: Number(v[1]), op: op < 0 ? 0 : op, operandType: fromVar ? 1 : 0, amount: Number(fromVar ? v[3] : v[4]) };
  }
  return { ...cond, type: 12, text };
};

/** Whether one pair of parens encloses the WHOLE expression (not "(a) && (b)"). */
const isWrapped = (s: string): boolean => {
  const t = s.trim();
  if (!t.startsWith('(') || !t.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(') depth++;
    else if (t[i] === ')') {
      depth--;
      // Closed before the end: two separate groups, e.g. "(a) && (b)".
      if (depth === 0) return i === t.length - 1;
    }
  }
  return false;
};

const unwrap = (s: string): string => (isWrapped(s) ? s.trim().slice(1, -1).trim() : s.trim());

/**
 * Split a composed expression on its top-level joiner.
 *
 * This ONLY ever decomposes expressions we authored ourselves, and refuses
 * everything else. Two rules enforce that:
 *
 *  - **Every part must be fully parenthesised.** `composeCondRuby` always wraps
 *    each test in its own parens, so requiring it is what tells our output apart
 *    from a hand-written expression. Without this, `a.none? { |x| p && q }` would
 *    split down the middle of a Ruby block and emit a SyntaxError — which does
 *    NOT fail closed, because eval_condition_script rescues StandardError and
 *    Ruby's SyntaxError is a ScriptError. It would also let `a ? b : c && d`
 *    re-associate into `(a ? b : c) && (d)`, which means something different.
 *  - **One joiner only.** A mix of `&&` and `||` has a precedence a flat list
 *    with a single join can't represent, so it stays one script condition.
 *
 * Depth tracking covers `()`, `[]`, `{}` and quoted strings.
 */
export const splitComposedCond = (expr: string): { parts: string[]; join: CondJoin } | null => {
  const raw: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  let join: CondJoin | null = null;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (depth === 0 && (expr.startsWith('&&', i) || expr.startsWith('||', i))) {
      const found: CondJoin = ch === '&' ? 'and' : 'or';
      if (join && join !== found) return null; // mixed precedence — don't guess
      join = found;
      raw.push(expr.slice(start, i));
      i++;
      start = i + 1;
    }
  }
  if (!join) return null;
  raw.push(expr.slice(start));
  if (!raw.every(isWrapped)) return null; // not ours — leave it alone
  return { parts: raw.map(unwrap), join };
};

/** The 111 subtypes this editor can represent. */
const EDITABLE_COND_TYPES = new Set([0, 1, 2, 12]);

/**
 * Whether a 111 can be opened in the editor at all.
 *
 * RMXP has subtypes we can't author — 3/4/5 actor/enemy, 6 facing direction,
 * 7 money, 8/9/10 item/weapon/armor, 11 button press. Real maps use them (the
 * exiting-arrow warps test facing direction; the vending machines test money),
 * and a branch we can't represent must stay CLOSED rather than be reopened as
 * something lossy — anything we turned it into would be a silent rewrite.
 */
export const isEditableConditional = (p: unknown[]): boolean => EDITABLE_COND_TYPES.has(Number(p[0]));

/**
 * Read a 111's parameters back into condition rows. A script conditional that
 * looks like one of ours decomposes into individual rows; a hand-written one
 * stays a single script test, so an expression we can't represent survives an
 * edit untouched.
 *
 * Returns null for a subtype we can't author — see `isEditableConditional`.
 */
export const condsFromParams = (p: unknown[]): { conds: CondEntry[]; join: CondJoin } | null => {
  const type = Number(p[0]);
  if (!EDITABLE_COND_TYPES.has(type)) return null;

  if (type === 12) {
    const expr = String(p[1] ?? '').trim();
    const composed = splitComposedCond(expr);
    if (composed) return { conds: composed.parts.map(condFromRuby), join: composed.join };
    return { conds: [condFromRuby(expr)], join: 'and' };
  }

  const cond = emptyCond();
  if (type === 0) {
    cond.type = 0;
    cond.id = Number(p[1]) || 1;
    cond.state = Number(p[2]) || 0;
  } else if (type === 2) {
    cond.type = 2;
    cond.key = String(p[1] ?? 'A');
    cond.state = Number(p[2]) || 0;
  } else {
    cond.type = 1;
    cond.id = Number(p[1]) || 1;
    cond.operandType = Number(p[2]) || 0;
    cond.amount = Number(p[3]) || 0;
    cond.op = Number(p[4]) || 0;
  }
  return { conds: [cond], join: 'and' };
};

/** 111 parameters for ONE condition, in its native subtype. */
export const nativeCondParams = (c: CondEntry): unknown[] => {
  switch (c.type) {
    case 0: // [0, switchId, 0=ON/1=OFF]
      return [0, c.id, c.state];
    case 2: // [2, letter, 0=ON/1=OFF]
      return [2, c.key || 'A', c.state];
    case 12: // [12, ruby string]
      return [12, c.text];
    case 1: // [1, varId, operandType, value|varId, operator]
    default:
      return [1, c.id, c.operandType, c.amount, c.op];
  }
};

/**
 * 111 parameters for a whole branch. One condition stays native to its subtype
 * so RMXP can still edit it and it round-trips exactly; several compose into a
 * single script conditional.
 */
export const condParams = (conds: CondEntry[], join: CondJoin): unknown[] => {
  const usable = conds.filter(isCondUsable);
  // Nothing usable: emit the first condition as-is rather than inventing a test.
  // An empty script conditional is real — `[12, ""]` occurs in this project — and
  // an empty eval returns nil, so the branch is always FALSE. Substituting
  // something like `true` would invert it. (canSubmitForm also blocks this, but
  // correctness here must not depend on a UI guard.)
  if (usable.length === 0) return nativeCondParams(conds[0] ?? emptyCond());
  if (usable.length === 1) return nativeCondParams(usable[0]);
  return [12, composeCondRuby(usable, join)];
};

/** Human-readable text for one condition, for the command list. */
export const describeCond = (c: CondEntry, swName: (id: number) => string, varName: (id: number) => string): string => {
  switch (c.type) {
    case 0:
      return `Switch ${swName(c.id)} is ${c.state === 0 ? 'ON' : 'OFF'}`;
    case 2:
      return `Self Switch "${c.key}" is ${c.state === 0 ? 'ON' : 'OFF'}`;
    case 12:
      return `Script: ${c.text}`;
    case 1:
    default:
      return `Variable ${varName(c.id)} ${VAR_OPS[c.op] ?? '=='} ${c.operandType === 1 ? `Variable ${varName(c.amount)}` : c.amount}`;
  }
};
