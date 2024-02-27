import { TrainerResourcesPath } from '@utils/path';
import { useTranslation } from 'react-i18next';

export const useTitleResource = () => {
  const { t } = useTranslation('database_trainers');

  const titleResource = (resource: TrainerResourcesPath) => {
    switch (resource) {
      case 'sprite':
        return t('battle_sprite');
      case 'artworkFull':
        return t('artwork_full');
      case 'artworkSmall':
        return t('artwork_small');
    }
    return t('battle_sprite');
  };

  return titleResource;
};
