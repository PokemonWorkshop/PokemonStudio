import { play, setEnabled, type SoundName } from 'cuelume';
import { getSetting, updateSettings } from './settings';

/**
 * Studio's interaction-sound layer, a thin wrapper over cuelume.
 *
 * Sound is the least forgiving feedback channel in the app: one badly-timed cue
 * and a user mutes the whole thing forever. So everything routes through here,
 * where a single persisted preference gates it. cuelume synthesises via Web
 * Audio, so there are no audio files to ship.
 *
 * Rules the call sites are expected to honour (enforced by review, not code):
 *  - Cues mark OUTCOMES, not inputs. The user knows they clicked; what they
 *    don't know is whether it worked.
 *  - Nothing in the map editor's working loop (paint/brush/tile-pick/zoom) and
 *    nothing on keyboard actions (Ctrl+S/Z/Y). Those fire hundreds of times a
 *    day and would be mute-bait.
 */

let enabled = false;

/**
 * Apply the persisted preference. Call once at boot, before the first cue can
 * fire. Reads localStorage, so renderer-only.
 */
export const initSound = () => {
  enabled = getSetting('soundEnabled');
  setEnabled(enabled);
};

/** Persist and apply a new preference. Backs the Settings > Sound toggle. */
export const setSoundEnabled = (value: boolean) => {
  enabled = value;
  updateSettings('soundEnabled', value);
  setEnabled(value);
};

/** The current in-memory state, for driving a controlled toggle. */
export const isSoundEnabled = () => enabled;

/**
 * Play an interaction cue. A no-op when sound is disabled, and never throws:
 * audio is non-essential decoration, so a failure here must never break the
 * action it was accompanying.
 */
export const playSound = (name: SoundName) => {
  if (!enabled) return;
  try {
    play(name);
  } catch {
    /* Web Audio can refuse (no user gesture yet, context suspended); ignore. */
  }
};

export type { SoundName };
