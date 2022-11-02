import { useEffect, useState } from 'react';
import { StudioShortcut } from '@src/GlobalStateProvider';

export const useShortcut = (keys: StudioShortcut[]) => {
  const [shortcut, setShortcut] = useState('');

  useEffect(() => {
    const listener = window.api.shortcut.on((key) => {
      if (keys.includes(key)) {
        setShortcut(key);
      }
      setShortcut('');
    });

    return () => window.api.shortcut.removeListener(listener);
  }, []);

  return shortcut;
};
