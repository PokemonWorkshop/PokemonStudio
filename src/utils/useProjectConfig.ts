import { PSDKConfigs, useGlobalState } from '@src/GlobalStateProvider';
import { SavingConfigMap } from './SavingUtils';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate config from a specific screen by specifying the config key.
 * @note This Hook **SHOULD NEVER** be used with `useGlobalState()`! **This cause data inconsistency**. If you need anything, this hook returns everything you need, just pass the result to children of your page!
 * @example
 * const {
 *  projectConfigValues: settings,
 *  setProjectConfigValues: setSettings,
 * } = useProjectConfig('settings_config');
 * @param key Key of the config collection you want to access from state.projectConfig
 */
export const useProjectConfig = <Key extends keyof PSDKConfigs>(key: Key) => {
  const [state, setState] = useGlobalState();
  const projectConfigValues = state.projectConfig[key];

  const setProjectConfigValues = (newConfigValues: PSDKConfigs[typeof key]) => {
    if (JSON.stringify(newConfigValues) !== JSON.stringify(projectConfigValues)) {
      setState((currentState) => ({
        ...currentState,
        projectConfig: { ...currentState.projectConfig, [key]: newConfigValues },
        savingConfig: new SavingConfigMap(state.savingConfig.set(key, 'UPDATE')),
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        projectConfig: { ...currentState.projectConfig, [key]: newConfigValues },
      }));
    }
  };

  return {
    projectConfigValues,
    setProjectConfigValues,
    state,
  };
};

/**
 * Captain Hook of the Hooks. This hook allow you to read config from a specific screen by specifying the config key.
 * @example
 * const {
 *  projectConfigValues: language,
 * } = useProjectConfigReadonly('language_config');
 * @param key Key of the config collection you want to access from state.projectConfig
 */
export const useProjectConfigReadonly = <Key extends keyof PSDKConfigs>(key: Key) => {
  const [state] = useGlobalState();
  const projectConfigValues = state.projectConfig[key];

  return {
    projectConfigValues,
    state,
  };
};

export const useConfigCredits = () => useProjectConfig('credits_config');
export type UseConfigCreditsReturnType = ReturnType<typeof useConfigCredits>;
export const useConfigDevices = () => useProjectConfig('devices_config');
export type UseConfigDevicesReturnType = ReturnType<typeof useConfigDevices>;
export const useConfigDisplay = () => useProjectConfig('display_config');
export type UseConfigDisplayReturnType = ReturnType<typeof useConfigDisplay>;
export const useConfigGraphic = () => useProjectConfig('graphic_config');
export type UseConfigGraphicReturnType = ReturnType<typeof useConfigGraphic>;
export const useConfigInfos = () => useProjectConfig('infos_config');
export type UseConfigInfosReturnType = ReturnType<typeof useConfigInfos>;
export const useConfigLanguage = () => useProjectConfig('language_config');
export type UseConfigLanguageReturnType = ReturnType<typeof useConfigLanguage>;
export const useConfigSave = () => useProjectConfig('save_config');
export type UseConfigSaveReturnType = ReturnType<typeof useConfigSave>;
export const useConfigSceneTitle = () => useProjectConfig('scene_title_config');
export type UseConfigSceneTitleReturnType = ReturnType<typeof useConfigSceneTitle>;
export const useConfigSettings = () => useProjectConfig('settings_config');
export type UseConfigSettingsReturnType = ReturnType<typeof useConfigSettings>;
export const useConfigTexts = () => useProjectConfig('texts_config');
export type UseConfigTextsReturnType = ReturnType<typeof useConfigTexts>;
export const useConfigGameOptions = () => useProjectConfig('game_options_config');
export type UseConfigGameOptionsReturnType = ReturnType<typeof useConfigGameOptions>;
