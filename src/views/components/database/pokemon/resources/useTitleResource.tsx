import { CreatureFormResourcesPath } from '@utils/path';
import { useTranslation } from 'react-i18next';

export const useTitleResource = () => {
  const { t } = useTranslation('database_pokemon');

  const titleResource = (resource: CreatureFormResourcesPath, isFemale: boolean, canBeFemale: boolean) => {
    if (isFemale) return t(resource);
    else if (canBeFemale) return t(`${resource}_alt` as never);
    return t(resource);
  };

  return titleResource;
};
