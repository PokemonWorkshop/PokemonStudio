import { useCallback, useState } from 'react';
import { getOnlineConfig, setActiveOnlineProject, setOnlineConfig, type OnlineConfig } from '@utils/onlineConfig';
import { useGlobalState } from '@src/GlobalStateProvider';

/**
 * Reactive accessor to the per-project Online config in localStorage.
 *
 * The config is keyed by the current project, so this hook re-points the module
 * accessors at `projectPath` and re-reads whenever the open project changes —
 * switching projects surfaces that project's own config with no stale-global
 * leakage. Mutations go through `update`/`replace` so the React tree re-renders;
 * other call sites that read via `getOnlineConfig()` (e.g. the HTTP helper) pick
 * up the value for whichever project is active on their next call.
 */
export const useOnlineConfig = () => {
  const [{ projectPath }] = useGlobalState();
  const [config, setConfigState] = useState<OnlineConfig>(() => {
    setActiveOnlineProject(projectPath);
    return getOnlineConfig();
  });
  // Re-point the module accessors and re-read when the open project changes,
  // adjusting state during render (React's "store info from previous renders"
  // pattern) rather than in an effect, so the switched-to project's own config
  // is what renders. The guard makes this fire only on an actual change.
  const [trackedPath, setTrackedPath] = useState(projectPath);
  if (trackedPath !== projectPath) {
    setActiveOnlineProject(projectPath);
    setTrackedPath(projectPath);
    setConfigState(getOnlineConfig());
  }

  const replace = useCallback((next: OnlineConfig) => {
    setOnlineConfig(next);
    setConfigState(next);
  }, []);

  const update = useCallback(<K extends keyof OnlineConfig>(key: K, value: OnlineConfig[K]) => {
    setConfigState((prev) => {
      const next = { ...prev, [key]: value };
      setOnlineConfig(next);
      return next;
    });
  }, []);

  return { config, replace, update };
};
