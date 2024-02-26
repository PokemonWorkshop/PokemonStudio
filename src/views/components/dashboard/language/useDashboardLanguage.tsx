import { StudioLanguageConfig } from '@modelEntities/config';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigGameOptions, useConfigLanguage } from '@utils/useProjectConfig';
import { useProjectStudio } from '@utils/useProjectStudio';
import { useUpdateLanguage } from './editors/useUpdateLanguage';

export type DashboardLanguageType = 'translation' | 'player';

const updateDefaultLanguage = (language: StudioLanguageConfig) => {
  if (language.choosableLanguageCode.indexOf(language.defaultLanguage) === -1) {
    language.defaultLanguage = language.choosableLanguageCode[0];
  }
};

export const useDashboardLanguage = () => {
  const { projectConfigValues: language, setProjectConfigValues: setLanguage } = useConfigLanguage(); // readonly
  const updateLanguage = useUpdateLanguage(language);
  const { projectConfigValues: gameOption, setProjectConfigValues: setGameOption } = useConfigGameOptions();
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();

  const onDeleteLanguage = (index: number, type: DashboardLanguageType) => {
    switch (type) {
      case 'player': {
        const currentEditedLanguage = cloneEntity(language);
        const currentEditedGameOption = cloneEntity(gameOption);
        currentEditedLanguage.choosableLanguageCode.splice(index, 1);
        currentEditedLanguage.choosableLanguageTexts.splice(index, 1);
        if (currentEditedLanguage.choosableLanguageCode.length <= 1) {
          currentEditedGameOption.order = currentEditedGameOption.order.filter((k) => k !== 'language');
        }
        updateDefaultLanguage(currentEditedLanguage);
        setLanguage(currentEditedLanguage);
        setGameOption(currentEditedGameOption);
        return;
      }
      case 'translation': {
        const projectStudioEdited = cloneEntity(projectStudio);
        projectStudioEdited.languagesTranslation.splice(index, 1);
        setProjectStudio(projectStudioEdited);
        return;
      }
      default:
        assertUnreachable(type);
    }
  };

  const onDefaultLanguage = (defaultLanguage: string) => updateLanguage({ defaultLanguage });

  return {
    onDeleteLanguage,
    onDefaultLanguage,
  };
};
