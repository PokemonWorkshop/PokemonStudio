/**
 * Local cache of mystery gifts created from this Studio install.
 *
 * The PSDK Online Server intentionally exposes no admin "list all gifts"
 * endpoint (per `PSDK_ONLINE_API.md`), so without a server-side change we have
 * no way to view gifts created in prior sessions / by other tools. We at least
 * keep a record of the ones *we* created here so the admin user can find
 * them later for off-band sharing or deletion.
 */
export type SessionGift = {
  giftId: string;
  title: string;
  type: 'internet' | 'code';
  code?: string;
  rarity?: number;
  createdAt: string;
  baseUrl: string;
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
