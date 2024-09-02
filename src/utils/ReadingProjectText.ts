import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_NAME_TEXT_ID,
  StudioCreatureForm,
} from '@modelEntities/creature';
import { StudioDex } from '@modelEntities/dex';
import { GROUP_NAME_TEXT_ID } from '@modelEntities/group';
import { ITEM_DESCRIPTION_TEXT_ID, ITEM_NAME_TEXT_ID, ITEM_PLURAL_NAME_TEXT_ID, ITEM_POCKET_NAME_TEXT_ID, StudioItem } from '@modelEntities/item';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID } from '@modelEntities/move';
import { QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID } from '@modelEntities/quest';
import { TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { State, ProjectText, TextsWithLanguageConfig, useGlobalState } from '@src/GlobalStateProvider';
import { getProjectTextChange } from '../hooks/updateProjectText';
import { updateSelectOptionsTextSource } from '../hooks/useSelectOptions';
import { TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { SavingTextMap } from './SavingUtils';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { MAP_INFO_FOLDER_NAME_TEXT_ID } from '@modelEntities/mapInfo';
import { cloneEntity } from './cloneEntity';
import { NATURE_NAME_TEXT_ID } from '@modelEntities/natures';

type KeyProjectText = keyof ProjectText;

const getLanguage = (fileText: string[][], defaultLanguage: string) => {
  const language = fileText[0].indexOf(defaultLanguage || 'en');
  return language == -1 ? 0 : language;
};

/**
 * Get a dialog message
 * @param projectText The text of the project
 * @param fileId id of the dialog file
 * @param textId id of the dialog message in the file (0 = 2nd line of csv, 1 = 3rd line of csv)
 * @param language language code of the language to get
 * @return the text
 */
export const getDialogMessage = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, language?: string) => {
  const fileText = projectText.texts[fileId as KeyProjectText];
  if (!fileText) return `Unable to find dialog file ${fileId}.`;
  const dialog = fileText[textId + 1];
  if (!dialog) return `Unable to find text ${textId} in dialog file ${fileId}.`;
  return dialog[getLanguage(fileText, language ?? projectText.defaultLanguage)];
};

/**
 * Get a text front the text database
 * @param projectText The text of the project
 * @param fileId ID of the text file
 * @param textId ID of the text in the file
 * @param language language code of the language to get
 * @returns the text
 */
export const getText = (projectText: TextsWithLanguageConfig, fileId: number, textId: number, language?: string) => {
  return getDialogMessage(projectText, fileId, textId, language);
};

export const useGetProjectText = () => {
  const [{ projectText: texts, projectConfig, projectStudio }] = useGlobalState();

  return (fileId: number, textId: number): string =>
    getText(
      { texts, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
      fileId,
      textId,
      projectConfig.language_config.defaultLanguage
    );
};

export type UseGetTextListReturnType = {
  dialog: string;
  textId: number;
};

export const useGetTextList = () => {
  const [{ projectText: texts, projectConfig }] = useGlobalState();

  return (fileId: number): UseGetTextListReturnType[] => {
    const fileText = texts[fileId];
    if (!fileText) return [];

    const language = getLanguage(fileText, projectConfig.language_config.defaultLanguage);
    const textList = fileText.map((dialog, index) => {
      const textId = index - 1;
      if (!dialog) return { dialog: `Unable to find text ${textId} in dialog file ${fileId}.`, textId };
      return { dialog: dialog[language], textId };
    });
    textList.shift();
    return textList;
  };
};

export const useSetProjectText = () => {
  const [{ projectText: texts, projectConfig, projectStudio }, setState] = useGlobalState();

  return (fileId: number, textId: number, text: string) => {
    setState((currentState) => {
      const currentText = getText(
        { texts, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
        fileId,
        textId,
        projectConfig.language_config.defaultLanguage
      );
      if (currentText === text) {
        return currentState;
      }
      const change = getProjectTextChange(currentState.projectConfig.language_config.defaultLanguage, textId, fileId, text, currentState.projectText);
      const newState = {
        ...currentState,
        savingText: new SavingTextMap(currentState.savingText.set(fileId, 'UPDATE')),
        projectText: {
          ...currentState.projectText,
          [change[0]]: change[1] as string[][],
        },
        textVersion: currentState.textVersion + 1,
      };
      // Ensure the selects have the right version of the text
      updateSelectOptionsTextSource(fileId, textId, newState);
      return newState;
    });
  };
};

export const useNewProjectText = () => {
  const [, setState] = useGlobalState();

  return (fileId: number, newTexts?: string[][]) => {
    setState((currentState) => {
      const newState = {
        ...currentState,
        savingText: new SavingTextMap(currentState.savingText.set(fileId, 'UPDATE')),
        projectText: {
          ...currentState.projectText,
          [fileId]: newTexts ?? [currentState.projectStudio.languagesTranslation.map(({ code }) => code)],
        },
        textVersion: currentState.textVersion + 1,
      };
      return newState;
    });
  };
};

export const useDeleteProjectText = () => {
  const [, setState] = useGlobalState();

  return (fileId: number) => {
    setState((currentState) => {
      const projectText = currentState.projectText;
      delete projectText[fileId];
      const newState = {
        ...currentState,
        savingText: new SavingTextMap(currentState.savingText.set(fileId, 'DELETE')),
        projectText: {
          ...projectText,
        },
        textVersion: currentState.textVersion + 1,
      };
      return newState;
    });
  };
};

export const useImportProjectText = () => {
  const [, setState] = useGlobalState();

  return (fileIdSrc: number, fileIdDest: number) => {
    setState((currentState) => {
      const newState = {
        ...currentState,
        savingText: new SavingTextMap(currentState.savingText.set(fileIdDest, 'UPDATE')),
        projectText: {
          ...currentState.projectText,
          [fileIdDest]: currentState.projectText[fileIdSrc],
        },
        textVersion: currentState.textVersion + 1,
      };
      return newState;
    });
  };
};

const ENTITY_TO_NAME_TEXT = {
  Ability: ABILITY_NAME_TEXT_ID,
  Specie: CREATURE_NAME_TEXT_ID,
  Item: ITEM_NAME_TEXT_ID,
  HealingItem: ITEM_NAME_TEXT_ID,
  PPHealItem: ITEM_NAME_TEXT_ID,
  AllPPHealItem: ITEM_NAME_TEXT_ID,
  BallItem: ITEM_NAME_TEXT_ID,
  ConstantHealItem: ITEM_NAME_TEXT_ID,
  StatBoostItem: ITEM_NAME_TEXT_ID,
  EVBoostItem: ITEM_NAME_TEXT_ID,
  EventItem: ITEM_NAME_TEXT_ID,
  FleeingItem: ITEM_NAME_TEXT_ID,
  LevelIncreaseItem: ITEM_NAME_TEXT_ID,
  ExpGiveItem: ITEM_NAME_TEXT_ID,
  PPIncreaseItem: ITEM_NAME_TEXT_ID,
  RateHealItem: ITEM_NAME_TEXT_ID,
  RepelItem: ITEM_NAME_TEXT_ID,
  StatusConstantHealItem: ITEM_NAME_TEXT_ID,
  StatusHealItem: ITEM_NAME_TEXT_ID,
  StatusRateHealItem: ITEM_NAME_TEXT_ID,
  StoneItem: ITEM_NAME_TEXT_ID,
  TechItem: ITEM_NAME_TEXT_ID,
  Move: MOVE_NAME_TEXT_ID,
  Quest: QUEST_NAME_TEXT_ID,
  TrainerBattleSetup: TRAINER_NAME_TEXT_ID,
  Type: TYPE_NAME_TEXT_ID,
  Zone: ZONE_NAME_TEXT_ID,
  Group: GROUP_NAME_TEXT_ID,
  TextInfo: TEXT_INFO_NAME_TEXT_ID,
  Map: MAP_NAME_TEXT_ID,
  MapInfoFolder: MAP_INFO_FOLDER_NAME_TEXT_ID,
  Nature: NATURE_NAME_TEXT_ID,
};

// TODO: All entities must accept undefined! (due to getting entity from state unsafely) => returns empty string and let UI manage it
// '' || '???' = '???'
export const useGetEntityNameText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: keyof Omit<typeof ENTITY_TO_NAME_TEXT, 'Ability' | 'Type' | 'TextInfo' | 'MapInfoFolder'>; id: number }) =>
    getEntityText(ENTITY_TO_NAME_TEXT[entity.klass], entity.id);
};

export const useGetEntityNameTextUsingTextId = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: 'Ability' | 'Type' | 'TextInfo' | 'MapInfoFolder'; textId: number }) =>
    getEntityText(ENTITY_TO_NAME_TEXT[entity.klass], entity.textId);
};

// Mapping between pocket id and pocket name id
export const pocketMapping = [0, 4, 1, 5, 3, 8, 0];
export const getItemPocketText = (item: StudioItem, state: State): string => {
  return getText(
    {
      texts: state.projectText,
      languages: state.projectStudio.languagesTranslation,
      defaultLanguage: state.projectConfig.language_config.defaultLanguage,
    },
    ITEM_POCKET_NAME_TEXT_ID,
    pocketMapping[item.socket] ?? item.socket
  );
};
export const useGetItemPocketText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: StudioItem['klass']; socket: number }) =>
    getEntityText(ITEM_POCKET_NAME_TEXT_ID, pocketMapping[entity.socket] ?? entity.socket);
};

export const useGetItemPluralNameText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: StudioItem['klass']; id: number }) => getEntityText(ITEM_PLURAL_NAME_TEXT_ID, entity.id);
};

export const useGetEntityNameUsingCSV = () => {
  const getEntityText = useGetProjectText();

  return (entity: { csv: StudioDex['csv'] }) => getEntityText(entity.csv.csvFileId, entity.csv.csvTextIndex);
};

const ENTITY_TO_DESCRIPTION_TEXT = {
  Ability: ABILITY_DESCRIPTION_TEXT_ID,
  Specie: CREATURE_DESCRIPTION_TEXT_ID,
  Item: ITEM_DESCRIPTION_TEXT_ID,
  HealingItem: ITEM_DESCRIPTION_TEXT_ID,
  PPHealItem: ITEM_DESCRIPTION_TEXT_ID,
  AllPPHealItem: ITEM_DESCRIPTION_TEXT_ID,
  BallItem: ITEM_DESCRIPTION_TEXT_ID,
  ConstantHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatBoostItem: ITEM_DESCRIPTION_TEXT_ID,
  EVBoostItem: ITEM_DESCRIPTION_TEXT_ID,
  EventItem: ITEM_DESCRIPTION_TEXT_ID,
  FleeingItem: ITEM_DESCRIPTION_TEXT_ID,
  LevelIncreaseItem: ITEM_DESCRIPTION_TEXT_ID,
  ExpGiveItem: ITEM_DESCRIPTION_TEXT_ID,
  PPIncreaseItem: ITEM_DESCRIPTION_TEXT_ID,
  RateHealItem: ITEM_DESCRIPTION_TEXT_ID,
  RepelItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusConstantHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StatusRateHealItem: ITEM_DESCRIPTION_TEXT_ID,
  StoneItem: ITEM_DESCRIPTION_TEXT_ID,
  TechItem: ITEM_DESCRIPTION_TEXT_ID,
  Move: MOVE_DESCRIPTION_TEXT_ID,
  Quest: QUEST_DESCRIPTION_TEXT_ID,
  Zone: ZONE_DESCRIPTION_TEXT_ID,
  TextInfo: TEXT_INFO_DESCRIPTION_TEXT_ID,
  Map: MAP_DESCRIPTION_TEXT_ID,
};

export const useGetEntityDescriptionText = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: keyof Omit<typeof ENTITY_TO_DESCRIPTION_TEXT, 'Ability' | 'TextInfo'>; id: number }) =>
    getEntityText(ENTITY_TO_DESCRIPTION_TEXT[entity.klass], entity.id);
};

export const useGetEntityDescriptionTextUsingTextId = () => {
  const getEntityText = useGetProjectText();

  return (entity: { klass: 'Ability' | 'TextInfo'; textId: number }) => getEntityText(ENTITY_TO_DESCRIPTION_TEXT[entity.klass], entity.textId);
};

export const getEntityNameText = (
  entity: { klass: keyof Omit<typeof ENTITY_TO_NAME_TEXT, 'Ability' | 'Type' | 'TextInfo' | 'MapInfoFolder'>; id: number },
  { projectText: texts, projectConfig, projectStudio }: Pick<State, 'projectText' | 'projectConfig' | 'projectStudio'>
) => {
  return getText(
    { texts, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
    ENTITY_TO_NAME_TEXT[entity.klass],
    entity.id,
    projectConfig.language_config.defaultLanguage
  );
};

export const getEntityNameTextUsingTextId = (
  entity: { klass: 'Ability' | 'Type' | 'TextInfo' | 'MapInfoFolder'; textId: number },
  { projectText: texts, projectConfig, projectStudio }: Pick<State, 'projectText' | 'projectConfig' | 'projectStudio'>
) => {
  return getText(
    { texts, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
    ENTITY_TO_NAME_TEXT[entity.klass],
    entity.textId,
    projectConfig.language_config.defaultLanguage
  );
};

export const useCopyProjectText = () => {
  const [, setState] = useGlobalState();

  return (src: { fileId: number; textId: number }, dest: { fileId: number; textId: number }) => {
    setState((currentState) => {
      const projectText = currentState.projectText;
      const headerTextSrc = projectText[src.fileId][0];
      const textSrc = projectText[src.fileId][src.textId];
      const headerTextDest = projectText[dest.fileId][0];

      const change = cloneEntity(projectText[dest.fileId]);
      let needToChange = false;
      textSrc.forEach((text, index) => {
        const srcCode = headerTextSrc[index];
        const destIndex = headerTextDest.findIndex((destCode) => destCode === srcCode);
        if (destIndex !== -1 && change[dest.textId][destIndex] !== text) {
          change[dest.textId][destIndex] = text;
          needToChange = true;
        }
      });

      if (!needToChange) {
        return currentState;
      }

      const newState = {
        ...currentState,
        savingText: new SavingTextMap(currentState.savingText.set(dest.fileId, 'UPDATE')),
        projectText: {
          ...projectText,
          [dest.fileId]: change,
        },
        textVersion: currentState.textVersion + 1,
      };
      // Ensure the selects have the right version of the text
      updateSelectOptionsTextSource(dest.fileId, dest.textId, newState);
      return newState;
    });
  };
};

export const useGetCreatureFormNameText = () => {
  const getEntityText = useGetProjectText();

  return (form: StudioCreatureForm) => getEntityText(CREATURE_FORM_NAME_TEXT_ID, form.formTextId.name);
};

export const useGetCreatureFormDescriptionText = () => {
  const getEntityText = useGetProjectText();

  return (form: StudioCreatureForm) => getEntityText(CREATURE_FORM_DESCRIPTION_TEXT_ID, form.formTextId.description);
};
