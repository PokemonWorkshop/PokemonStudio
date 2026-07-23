import type { RMXPEvent } from './events/rmxpEventUtils';

/**
 * Fork-owned. In-memory store of unsaved map edits, keyed by map db_symbol.
 *
 * Why this exists: the tile edits themselves live inside the WASM/libtiled
 * instance, and that instance holds exactly ONE map at a time. Loading another
 * map into it destroys whatever the previous map had pending. That is why the
 * editor could only ever save "the live map".
 *
 * So before the active map changes we serialize it (`saveBytes()`) and park the
 * bytes here; when the user comes back we push those bytes into the WASM VFS
 * instead of re-reading the file from disk. The result is RPG Maker XP's model:
 * edit several maps, move between them freely, and decide what to write later.
 *
 * Deliberately memory-only — nothing is mirrored to disk. Pending work is lost
 * if Studio is force-quit, exactly like RMXP, and the unsaved-changes guard is
 * what protects against losing it by accident. That also means there is no
 * scratch cache to invalidate: saving a map simply drops its entry.
 */

export type PendingMapEdit = {
  /** Map db_symbol — the key callers use everywhere else in Studio. */
  dbSymbol: string;
  /** Shown in the save dialog so the user recognises the map. */
  mapName: string;
  /** Needed to write the map back out. */
  tiledFilename: string;
  /** Serialized .tmx bytes carrying the unsaved tile edits, if any. */
  tiles?: Uint8Array;
  /** Unsaved events, ready to hand to writeRMXPEvents, if any. */
  events?: RMXPEvent[];
};

const edits = new Map<string, PendingMapEdit>();
const listeners = new Set<() => void>();

/** Snapshot handed to useSyncExternalStore; re-created only when the store changes. */
let snapshot: PendingMapEdit[] = [];

const notify = () => {
  snapshot = [...edits.values()];
  listeners.forEach((listener) => listener());
};

/**
 * Record (or update) the pending edit for a map. Fields left undefined keep
 * whatever was already stored, so tiles and events can be stashed separately.
 */
export const setPendingEdit = (edit: PendingMapEdit) => {
  const previous = edits.get(edit.dbSymbol);
  const next: PendingMapEdit = {
    ...previous,
    ...edit,
    tiles: edit.tiles ?? previous?.tiles,
    events: edit.events ?? previous?.events,
  };
  // Nothing actually pending — don't leave an empty row in the save dialog.
  if (!next.tiles && !next.events) {
    if (previous) {
      edits.delete(edit.dbSymbol);
      notify();
    }
    return;
  }
  edits.set(edit.dbSymbol, next);
  notify();
};

/** Drop one kind of pending edit, or the whole entry when both are gone. */
export const clearPendingEdit = (dbSymbol: string, what: 'tiles' | 'events' | 'all' = 'all') => {
  const current = edits.get(dbSymbol);
  if (!current) return;
  if (what === 'all') {
    edits.delete(dbSymbol);
    notify();
    return;
  }
  const next: PendingMapEdit = { ...current, [what]: undefined };
  if (!next.tiles && !next.events) edits.delete(dbSymbol);
  else edits.set(dbSymbol, next);
  notify();
};

export const getPendingEdit = (dbSymbol: string): PendingMapEdit | undefined => edits.get(dbSymbol);

/** Every map with something unsaved. Stable reference between changes. */
export const getPendingEdits = (): PendingMapEdit[] => snapshot;

export const hasPendingEdits = (): boolean => edits.size > 0;

export const subscribePendingEdits = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Drop everything — used when the project closes or changes. */
export const clearAllPendingEdits = () => {
  if (edits.size === 0) return;
  edits.clear();
  notify();
};
