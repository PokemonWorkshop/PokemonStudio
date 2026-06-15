import { getOnlineConfig, type OnlineConfig } from './onlineConfig';
import type { OnlineHttpRequestInput, OnlineHttpRequestOutput } from '@src/backendTasks/onlineHttpRequest';

/**
 * Typed client for the PSDK Online Server. Builds URLs and headers from the
 * current `OnlineConfig`, then dispatches through the main-process
 * `onlineHttpRequest` backend task.
 *
 * The backend task already wraps fetch in a result envelope, so these helpers
 * return a `Promise<OnlineHttpRequestOutput>` directly — callers branch on
 * `result.ok` rather than try/catch. Errors thrown here mean the call was
 * malformed before we could even hit the network (e.g. missing baseUrl).
 */

type Method = OnlineHttpRequestInput['method'];

type AuthFlags = {
  apiKey?: boolean;
  adminKey?: boolean;
  playerId?: boolean;
};

const joinUrl = (baseUrl: string, path: string) => {
  if (!baseUrl) throw new Error('Online base URL is not configured.');
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${cleanedPath}`;
};

const buildHeaders = (cfg: OnlineConfig, auth: AuthFlags): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (auth.apiKey) {
    if (!cfg.apiKey) throw new Error('API key is not configured.');
    headers['x-api-key'] = cfg.apiKey;
  }
  if (auth.adminKey) {
    if (!cfg.adminKey) throw new Error('Admin key is not configured.');
    headers['x-admin-key'] = cfg.adminKey;
  }
  if (auth.playerId) {
    if (!cfg.playerId) throw new Error('Player ID is not configured.');
    headers['x-player-id'] = cfg.playerId;
  }
  return headers;
};

const callBackend = (input: OnlineHttpRequestInput): Promise<OnlineHttpRequestOutput> =>
  new Promise<OnlineHttpRequestOutput>((resolve) => {
    window.api.onlineHttpRequest(
      input,
      (output) => resolve(output as OnlineHttpRequestOutput),
      ({ errorMessage }) => resolve({ ok: false, status: 0, body: null, error: errorMessage }),
    );
  });

const request = async (method: Method, path: string, auth: AuthFlags, body?: unknown): Promise<OnlineHttpRequestOutput> => {
  const cfg = getOnlineConfig();
  const url = joinUrl(cfg.baseUrl, path);
  const headers = buildHeaders(cfg, auth);
  return callBackend({ url, method, headers, body });
};

// ─── Public API helpers ────────────────────────────────────────────────────

/** GET /health — public; verifies the server is reachable. No auth needed. */
export const onlineHealth = async (): Promise<OnlineHttpRequestOutput> => {
  const cfg = getOnlineConfig();
  return callBackend({ url: joinUrl(cfg.baseUrl, '/health'), method: 'GET' });
};

// ─── Mystery Gift — admin ──────────────────────────────────────────────────

export type GiftItem = { id: string; count: number };

export type GiftCreature = {
  id: string;
  level: number;
  shiny?: boolean;
  form?: number;
  gender?: string;
  nature?: string;
  ability?: number | string;
  loyalty?: number;
  stats?: [number, number, number, number, number, number];
  bonus?: number[];
  moves?: string[];
  item?: number | string;
  given_name?: string;
  captured_with?: number | string;
  captured_in?: number;
  trainer_name?: string;
  trainer_id?: number;
};

export type GiftEgg = Omit<GiftCreature, 'moves' | 'item' | 'given_name' | 'captured_with' | 'captured_in'>;

export type GiftRarity = 0 | 1 | 2 | 3;
export type GiftType = 'internet' | 'code';

export type CreateGiftBody = {
  title: string;
  type: GiftType;
  code?: string;
  items?: GiftItem[];
  creatures?: GiftCreature[];
  eggs?: GiftEgg[];
  allowedClaimers?: string[];
  maxClaims?: number;
  alwaysAvailable?: boolean;
  validFrom?: string;
  validTo?: string;
  rarity?: GiftRarity;
};

export const createMysteryGift = (body: CreateGiftBody) =>
  request('POST', '/api/v1/mystery-gift/admin/create', { adminKey: true }, body);

// ─── Mystery Gift — player ─────────────────────────────────────────────────

/** Player-scoped list of internet-type gifts the configured playerId can claim. */
export const listClaimableMysteryGifts = () =>
  request('GET', '/api/v1/mystery-gift', { apiKey: true, playerId: true });
