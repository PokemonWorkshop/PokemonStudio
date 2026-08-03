/**
 * Per-Studio-install configuration for the PSDK Online Server.
 *
 * `baseUrl` and `apiKey` are tied to a specific server deployment; `adminKey`
 * is the privileged admin token for the server's `/admin/...` routes (mystery-gift
 * admin, maintenance, telemetry); `playerId` is whichever player the user
 * wants to act as when hitting player-scoped routes for testing.
 *
 * Stored in `localStorage`, keyed PER PROJECT (`onlineConfig:<projectHash>`), so
 * each project has its own server/keys and switching projects never leaks another
 * project's config. It's kept independent of Studio's main `settings` blob — the
 * two have different scopes (this is sensitive, the other is preferences) — and
 * deliberately NOT written into the project files: the `adminKey` is plaintext and
 * must not end up committed/shared.
 *
 * The active project is set via `setActiveOnlineProject(projectPath)` on project
 * load (see the project-load processor) and kept in sync by `useOnlineConfig`.
 * With no active project (app boot, no project open) reads return defaults and
 * writes are no-ops, rather than touching a stale global blob.
 *
 * SECURITY NOTE: the admin key sits in plaintext localStorage on disk for
 * convenience. Anyone with read access to this machine's user profile can
 * recover it. A future pass should move it into Electron `safeStorage` (or
 * the OS credential manager) — recorded as a follow-up in the Online section.
 */
export type OnlineConfig = {
  baseUrl: string;
  apiKey: string;
  adminKey: string;
  playerId: string;
};

/** Prefix for the per-project keys; also the bare LEGACY key from before keying. */
const STORAGE_PREFIX = 'onlineConfig';

const defaultOnlineConfig: OnlineConfig = {
  baseUrl: '',
  apiKey: '',
  adminKey: '',
  playerId: '',
};

/**
 * Stable, collision-safe key derived from the project's absolute path. We hash
 * (djb2) rather than embed the raw path so the storage key is short and doesn't
 * spill the filesystem layout; path separators/case are normalised first so the
 * same project always maps to the same key on this machine.
 */
const hashProjectPath = (projectPath: string): string => {
  const normalized = projectPath.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
};

/** The project whose config `get`/`setOnlineConfig` currently read/write. */
let activeProjectKey: string | null = null;

/**
 * Point the config accessors at a project (or clear them with `null`). Called
 * from the project-load processor so it's correct before any online call, and
 * re-asserted by `useOnlineConfig` whenever `projectPath` changes.
 */
export const setActiveOnlineProject = (projectPath: string | null | undefined): void => {
  activeProjectKey = projectPath && projectPath.trim() ? hashProjectPath(projectPath) : null;
};

/** The full localStorage key for the active project, or null when none is active. */
const activeStorageKey = (): string | null => (activeProjectKey ? `${STORAGE_PREFIX}:${activeProjectKey}` : null);

const parseConfig = (raw: string): OnlineConfig => ({ ...defaultOnlineConfig, ...(JSON.parse(raw) as Partial<OnlineConfig>) });

export const getOnlineConfig = (): OnlineConfig => {
  const key = activeStorageKey();
  // No project active: never fall back to another project's blob.
  if (!key) return defaultOnlineConfig;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return parseConfig(raw);
    } catch {
      return defaultOnlineConfig;
    }
  }
  // One-time migration: the first project opened after this change inherits the
  // legacy global blob, which is then removed so other projects start fresh.
  const legacy = localStorage.getItem(STORAGE_PREFIX);
  if (legacy) {
    try {
      const migrated = parseConfig(legacy);
      localStorage.setItem(key, JSON.stringify(migrated));
      localStorage.removeItem(STORAGE_PREFIX);
      return migrated;
    } catch {
      /* legacy blob unparseable — fall through to defaults */
    }
  }
  return defaultOnlineConfig;
};

export const setOnlineConfig = (next: OnlineConfig): void => {
  const key = activeStorageKey();
  // No active project: refuse the write rather than create an unkeyed global.
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(next));
};

export const updateOnlineConfig = <K extends keyof OnlineConfig>(key: K, value: OnlineConfig[K]): OnlineConfig => {
  const next = { ...getOnlineConfig(), [key]: value };
  setOnlineConfig(next);
  return next;
};

/** True when the bare minimum (baseUrl + apiKey) is set so player routes work. */
export const isOnlineBasicallyConfigured = (cfg: OnlineConfig = getOnlineConfig()): boolean =>
  Boolean(cfg.baseUrl && cfg.apiKey);

/** True when admin routes are usable. */
export const isOnlineAdminConfigured = (cfg: OnlineConfig = getOnlineConfig()): boolean =>
  Boolean(cfg.baseUrl && cfg.adminKey);

/** True when player-scoped routes (list gifts, GTS, friends…) are usable. */
export const isOnlinePlayerConfigured = (cfg: OnlineConfig = getOnlineConfig()): boolean =>
  Boolean(cfg.baseUrl && cfg.apiKey && cfg.playerId);
