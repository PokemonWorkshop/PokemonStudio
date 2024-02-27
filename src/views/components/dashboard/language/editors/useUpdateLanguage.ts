import { StudioLanguageConfig } from '@modelEntities/config';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigLanguage } from '@utils/useProjectConfig';
import { useCallback } from 'react';

export const useUpdateLanguage = (language: StudioLanguageConfig) => {
  const { setProjectConfigValues: setLanguage } = useConfigLanguage();

  return useCallback(
    (updates: Partial<StudioLanguageConfig>) => {
      const updatedLanguage = {
        ...cloneEntity(language),
        ...updates,
      };
      setLanguage(updatedLanguage);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );
};
