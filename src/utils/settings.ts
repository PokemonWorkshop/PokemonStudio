export type StudioSettings = {
  tiledPath: string;
  /** Whether Studio plays interaction sounds. Persisted; honoured on boot by initSound(). */
  soundEnabled: boolean;
};

const defaultSettings: StudioSettings = {
  tiledPath: '',
  // Off by default -- interaction sound is a minority taste, so it's opt-in via
  // Settings > Sound rather than something every user has to discover and mute.
  soundEnabled: false,
};

/**
 * Get all settings of the application
 * @returns A settings object containing the settings of the application
 */
export const getSettings = (): StudioSettings => {
  const settingsJson = localStorage.getItem('settings');
  if (!settingsJson) return defaultSettings;

  // Merge over defaults so a key added after the user's settings were first
  // written (e.g. soundEnabled) still resolves to its default instead of
  // undefined.
  return { ...defaultSettings, ...JSON.parse(settingsJson) };
};

/**
 * Get one setting of the application
 * @param key The setting to get
 * @returns The setting associed at the key
 */
export const getSetting = <Key extends keyof StudioSettings>(key: Key) => {
  const settings = getSettings();
  return settings[key];
};

/**
 * Update the settings of the application
 * @param key The setting which should be updated
 * @param value The value associed at setting
 */
export const updateSettings = <Key extends keyof StudioSettings>(key: Key, value: StudioSettings[Key]) => {
  const settings = getSettings();
  const updatedSettings = {
    ...settings,
    [key]: value,
  };
  localStorage.setItem('settings', JSON.stringify(updatedSettings));
};
