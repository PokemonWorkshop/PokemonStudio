import { StudioLanguageConfig } from '@modelEntities/config';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectConfigReadonly } from '@utils/useProjectConfig';
import { useProjectStudioReadonly } from '@utils/useProjectStudio';
import { useUpdateLanguage } from './editors/useUpdateLanguage';
import { useUpdateGameOptions } from '../gameOptions';
import { useUpdateProjectStudio } from '@utils/useUpdateProjectStudio';

export type DashboardLanguageType = 'translation' | 'player';
export type QuickAddLanguageConfigResult = 'success' | 'already_exist' | 'open_new';

const updateDefaultLanguage = (language: StudioLanguageConfig) => {
  if (language.choosableLanguageCode.indexOf(language.defaultLanguage) === -1) {
    language.defaultLanguage = language.choosableLanguageCode[0];
  }
};

export const useDashboardLanguage = () => {
  const { projectConfigValues: language } = useProjectConfigReadonly('language_config');
  const updateLanguage = useUpdateLanguage(language);
  const { projectConfigValues: gameOptions } = useProjectConfigReadonly('game_options_config');
  const updateGameOptions = useUpdateGameOptions(gameOptions);
  const { projectStudioValues: projectStudio } = useProjectStudioReadonly();
  const updateProjectStudio = useUpdateProjectStudio(projectStudio);

  const onDeleteLanguage = (index: number, type: DashboardLanguageType) => {
    switch (type) {
      case 'player': {
        const currentEditedLanguage = cloneEntity(language);
        currentEditedLanguage.choosableLanguageCode.splice(index, 1);
        currentEditedLanguage.choosableLanguageTexts.splice(index, 1);
        if (currentEditedLanguage.choosableLanguageCode.length <= 1) {
          updateGameOptions({ order: gameOptions.order.filter((k) => k !== 'language') });
        }
        updateDefaultLanguage(currentEditedLanguage);
        updateLanguage(currentEditedLanguage);
        return;
      }
      case 'translation': {
        const languagesTranslation = cloneEntity(projectStudio.languagesTranslation);
        languagesTranslation.splice(index, 1);
        updateProjectStudio({ languagesTranslation });
        return;
      }
      default:
        assertUnreachable(type);
    }
  };

  const quickAddLanguageConfig = (from: DashboardLanguageType, value: string): QuickAddLanguageConfigResult => {
    if (from === 'translation') return 'open_new';

    const text = value.toLowerCase();
    const languageTranslation = projectStudio.languagesTranslation.find(
      ({ code, name }) => code.toLowerCase() === text || name.toLowerCase() === text
    );
    if (!languageTranslation) return 'open_new';
    if (language.choosableLanguageCode.find((code) => languageTranslation.code === code)) return 'already_exist';

    const currentEditedLanguage = cloneEntity(language);
    currentEditedLanguage.choosableLanguageCode.push(languageTranslation.code);
    currentEditedLanguage.choosableLanguageTexts.push(languageTranslation.name);
    updateLanguage(currentEditedLanguage);
    return 'success';
  };

  const onChangeDefaultLanguage = (defaultLanguage: string) => updateLanguage({ defaultLanguage });

  return {
    languageConfig: language,
    gameOptions,
    projectStudio,
    onDeleteLanguage,
    onChangeDefaultLanguage,
    quickAddLanguageConfig,
    updateLanguageConfig: updateLanguage,
    updateGameOptions,
    updateProjectStudio,
  };
};
