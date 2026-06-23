import { useEffect } from 'react';

const STUDIO_CTRL_SHORTCUTS = {
  db_previous: ['ArrowLeft', 'Left'],
  db_next: ['ArrowRight', 'Right'],
  db_new: ['KeyN'],
  save: ['KeyS'],
  play: ['KeyP'],
} as const;

const STUDIO_CTRL_SHIFT_SHORTCUTS = {
  db_previous_variant: ['ArrowLeft', 'Left'],
  db_next_variant: ['ArrowRight', 'Right'],
  db_copy_identifier: ['KeyC'],
} as const;

export type StudioShortcut = keyof typeof STUDIO_CTRL_SHORTCUTS | keyof typeof STUDIO_CTRL_SHIFT_SHORTCUTS;
export type StudioShortcutActions = Partial<Record<StudioShortcut, () => void>>;

const KEY_TO_STUDIO_CTRL_SHORTCUT = Object.fromEntries(
  Object.entries(STUDIO_CTRL_SHORTCUTS).flatMap(([studioShortcut, keys]) => keys.map((key) => [key, studioShortcut as StudioShortcut])),
);

const KEY_TO_STUDIO_CTRL_SHIFT_SHORTCUT = Object.fromEntries(
  Object.entries(STUDIO_CTRL_SHIFT_SHORTCUTS).flatMap(([studioShortcut, keys]) => keys.map((key) => [key, studioShortcut as StudioShortcut])),
);

export const useShortcut = (shortcutActions: StudioShortcutActions) => {
  useEffect(() => {
    // Listener for the menu click
    const listener = window.api.shortcut.on((key) => {
      const action = shortcutActions[key];
      if (action) action();
    });
    // Listener for the actual Window shortcuts
    const handleKeyUp = (e: KeyboardEvent) => {
      // Check that the key pressed is put up while the Command or Control key is still down
      if (window.api.platform === 'darwin') {
        if (!e.altKey) return;
      } else {
        if (!e.ctrlKey) return;
      }

      const shortcut = e.shiftKey ? KEY_TO_STUDIO_CTRL_SHIFT_SHORTCUT[e.code] : KEY_TO_STUDIO_CTRL_SHORTCUT[e.code];
      const action = shortcutActions[shortcut];
      if (action) action();
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.api.shortcut.removeListener(listener);
    };
  }, [shortcutActions]);
};
