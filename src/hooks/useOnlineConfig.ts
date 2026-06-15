import { useCallback, useState } from 'react';
import { getOnlineConfig, setOnlineConfig, type OnlineConfig } from '@utils/onlineConfig';

/**
 * Reactive accessor to the Online config blob in localStorage.
 *
 * Mutations go through `update`/`replace` so the React tree re-renders on
 * change. Other call sites that read via `getOnlineConfig()` (e.g. the HTTP
 * helper) will pick up the new value on their next call.
 */
export const useOnlineConfig = () => {
  const [config, setConfigState] = useState<OnlineConfig>(() => getOnlineConfig());

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
