/**
 * Tiny module-level registry for the map editor's own save targets.
 *
 * Background: Studio's global Ctrl+S (registered by SaveProjectButton via
 * useShortcut) saves the entire project. When the user is in the in-Studio
 * map editor (PSDK fork), Ctrl+S should save *just the current map* — not
 * trigger a full project save with its associated map-modified warning.
 *
 * The same handles drive the save button's split menu ("Save maps" / "Save
 * events"): those act on the map that is currently open, which is what you'd
 * actually reach for while mapping. They only exist while the map editor route
 * is mounted, so the menu greys them out everywhere else.
 *
 * We model that as targets the active route claims on mount and releases on
 * unmount. Implemented as a module ref instead of context so SaveProjectButton,
 * which lives in the app shell, doesn't need a provider above the map editor
 * route.
 */

type SaveOverride = () => void;

/** What the map editor exposes to the app shell while it is open. */
export type MapEditorSaveTargets = {
  /** Write the open map's tiles. */
  saveMap: () => void;
  /** Write the open map's events. */
  saveEvents: () => void;
  /** Whether the open map has unsaved tile edits. */
  mapDirty: boolean;
  /** Whether the open map has unsaved event edits. */
  eventsDirty: boolean;
};

let current: SaveOverride | null = null;
let targets: MapEditorSaveTargets | null = null;
const listeners = new Set<() => void>();

export const setSaveShortcutOverride = (fn: SaveOverride | null) => {
  current = fn;
};

export const getSaveShortcutOverride = (): SaveOverride | null => current;

/**
 * Publish (or clear, with null) the map editor's save targets. Notifies the
 * save button so its menu enables/disables in step with the dirty flags.
 */
export const setMapEditorSaveTargets = (next: MapEditorSaveTargets | null) => {
  targets = next;
  listeners.forEach((listener) => listener());
};

export const getMapEditorSaveTargets = (): MapEditorSaveTargets | null => targets;

/** Subscribe to target changes — drives useSyncExternalStore in the button. */
export const subscribeMapEditorSaveTargets = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
