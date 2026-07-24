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
  /**
   * Write every pending map's tiles, no questions asked. This is the ACTION —
   * "Save all" must call it directly, never the dialog, or Save all silently
   * becomes a dialog-opener and the project save pipeline never runs.
   */
  saveMap: () => Promise<void>;
  /**
   * Ask which maps/events to write. Shared by "Save maps", "Save events" and
   * "Save all" — one dialog for all three, so what gets written is always an
   * explicit choice.
   * @param thenProjectSave continue into the project pipeline after writing,
   *   which is what makes the change take effect in game. Set by "Save all".
   */
  openSaveDialog: (thenProjectSave?: boolean) => void;
  /** Write the open map's events. */
  saveEvents: () => Promise<void>;
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
/**
 * The app shell's project-save pipeline, published so the map editor can run it
 * after writing map files. Saving a map only takes effect once the pipeline
 * (saveMapInfo / saveRMXPMapInfo) has run too, and that lives in the nav button
 * — so the dialog needs a way to reach back for it.
 */
let projectSaveRunner: (() => void) | null = null;

export const setProjectSaveRunner = (fn: (() => void) | null) => {
  projectSaveRunner = fn;
};

export const runProjectSave = () => projectSaveRunner?.();

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
