export type StudioSettings = {
  tiledPath: string;
};

const defaultSettings: StudioSettings = {
  tiledPath: '',
};

/**
 * Get all settings of the application
 * @returns A settings object containing the settings of the application
 */
export const getSettings = (): StudioSettings => {
  const settingsJson = localStorage.getItem('settings');
  if (!settingsJson) return defaultSettings;

  return JSON.parse(settingsJson);
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
