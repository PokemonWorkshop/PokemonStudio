/**
 * Per-Studio-install configuration for the PSDK Online Server.
 *
 * `baseUrl` and `apiKey` are tied to a specific server deployment; `adminKey`
 * is the privileged admin token for the server's `/admin/...` routes (mystery-gift
 * admin, maintenance, telemetry); `playerId` is whichever player the user
 * wants to act as when hitting player-scoped routes for testing.
 *
 * Stored in `localStorage` as a single JSON blob under `onlineConfig` to keep
 * it independent of Studio's main `settings` blob — the two have different
 * scopes (this is sensitive, the other is preferences).
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

const STORAGE_KEY = 'onlineConfig';

const defaultOnlineConfig: OnlineConfig = {
  baseUrl: '',
  apiKey: '',
  adminKey: '',
  playerId: '',
};

export const getOnlineConfig = (): OnlineConfig => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultOnlineConfig;
  try {
    return { ...defaultOnlineConfig, ...(JSON.parse(raw) as Partial<OnlineConfig>) };
  } catch {
    return defaultOnlineConfig;
  }
};

export const setOnlineConfig = (next: OnlineConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
