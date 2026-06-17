import type { GiftCreature, GiftEgg, GiftItem } from './onlineApi';

/**
 * Local cache of mystery gifts created from this Studio install.
 *
 * The PSDK Online Server intentionally exposes no admin "list all gifts"
 * endpoint (per `PSDK_ONLINE_API.md`), so without a server-side change we have
 * no way to view gifts created in prior sessions / by other tools. We at least
 * keep a record of the ones *we* created here so the admin user can find
 * them later for off-band sharing or deletion.
 *
 * We persist the full body (items / creatures / eggs / dates / claim limits)
 * because the create response contains it and that's the only source of truth
 * the user can see for local cards — `Gifts on server` is player-scoped and
 * won't show code-type or already-claimed gifts.
 */
export type SessionGift = {
  giftId: string;
  title: string;
  type: 'internet' | 'code';
  code?: string;
  rarity?: number;
  createdAt: string;
  baseUrl: string;

  // Full payload — captured at create time so detail rendering doesn't need a refetch.
  items?: GiftItem[];
  creatures?: GiftCreature[];
  eggs?: GiftEgg[];
  allowedClaimers?: string[];
  maxClaims?: number;
  alwaysAvailable?: boolean;
  validFrom?: string;
  validTo?: string;

  /**
   * Tracks the server-side soft-delete state. Undefined or `true` means the
   * gift is still active on the server; `false` means we successfully called
   * `DELETE /admin/:giftId` and the server set `isActive: false`. We keep
   * disabled gifts in the cache so devs still have a record of past work
   * (the server has no admin "list all" endpoint yet).
   */
  isActive?: boolean;
  /** ISO timestamp set when isActive flips to false. */
  disabledAt?: string;
};

const STORAGE_KEY = 'onlineSessionGifts';

export const getSessionGifts = (): SessionGift[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionGift[]) : [];
  } catch {
    return [];
  }
};

export const recordSessionGift = (gift: SessionGift): SessionGift[] => {
  const current = getSessionGifts();
  const next = [gift, ...current.filter((g) => g.giftId !== gift.giftId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearSessionGifts = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const removeSessionGift = (giftId: string): SessionGift[] => {
  const next = getSessionGifts().filter((g) => g.giftId !== giftId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

/**
 * Soft-disable the cached entry — keeps the record so devs can see what they
 * deleted, but flips `isActive` to false so the UI can show it in a separate
 * "Disabled" section. Idempotent; no-ops if the giftId isn't in the cache.
 */
export const markSessionGiftDisabled = (giftId: string): SessionGift[] => {
  const now = new Date().toISOString();
  const next = getSessionGifts().map((g) => (g.giftId === giftId ? { ...g, isActive: false, disabledAt: now } : g));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

/**
 * Upsert a gift into the cache and stamp it as disabled. Used when the user
 * deletes a gift that was *fetched from the server* (not created from this
 * device), so we have no prior cache entry to flip — we need to ingest the
 * gift payload from the server view at delete time, otherwise the Disabled
 * section would never show it.
 */
export const upsertSessionGiftAsDisabled = (gift: Omit<SessionGift, 'isActive' | 'disabledAt' | 'createdAt' | 'baseUrl'> & Partial<Pick<SessionGift, 'createdAt' | 'baseUrl'>>): SessionGift[] => {
  const now = new Date().toISOString();
  const current = getSessionGifts();
  const existing = current.find((g) => g.giftId === gift.giftId);
  if (existing) return markSessionGiftDisabled(gift.giftId);

  const entry: SessionGift = {
    ...gift,
    createdAt: gift.createdAt ?? now,
    baseUrl: gift.baseUrl ?? '',
    isActive: false,
    disabledAt: now,
  };
  const next = [entry, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const isSessionGiftActive = (g: SessionGift): boolean => g.isActive !== false;
