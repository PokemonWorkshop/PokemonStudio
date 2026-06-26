/**
 * Tiny module-level handle for "save shortcut override".
 *
 * Background: Studio's global Ctrl+S (registered by SaveProjectButton via
 * useShortcut) saves the entire project. When the user is in the in-Studio
 * map editor (PSDK fork), Ctrl+S should save *just the current map* — not
 * trigger a full project save with its associated map-modified warning.
 *
 * We model that as a setter the active route can claim on mount and release
 * on unmount. SaveProjectButton checks the override before running its
 * default save flow.
 *
 * Implemented as a module ref instead of context so SaveProjectButton, which
 * is at the app shell, doesn't need a provider above the map editor route.
 */

type SaveOverride = () => void;

let current: SaveOverride | null = null;

export const setSaveShortcutOverride = (fn: SaveOverride | null) => {
  current = fn;
};

export const getSaveShortcutOverride = (): SaveOverride | null => current;
