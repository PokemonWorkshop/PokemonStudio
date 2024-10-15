import type { StudioMove } from '@modelEntities/move';
import {
  getEntityNameTextUsingTextId,
  getEntityNameText,
  useGetEntityNameTextUsingTextId,
  useGetEntityNameText,
  useGetCreatureFormNameText,
} from '@utils/ReadingProjectText';
import { useProjectDataReadonly } from './useProjectData';
import { useTextInfosReadonly } from './useTextInfos';
import type { StudioDex } from '@modelEntities/dex';
import type { StudioType } from '@modelEntities/type';
import type { StudioItem } from '@modelEntities/item';
import type { StudioNature } from '@modelEntities/nature';
import { Language } from '@pages/texts/Translation.page';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMapOverviewPath } from '@utils/resourcePath';
import { showNotification } from '@utils/showNotification';
import { join } from '@utils/path';
import { useGeneratingMapOverview } from './useGeneratingMapOverview';
import { useLoaderRef } from '@utils/loaderContext';
import { getSetting } from '@utils/settings';

export const useAbilityPage = () => {
  const { projectDataValues: abilities, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('abilities', 'ability');
  const ability = abilities[dbSymbol];
  const abilityName = getEntityNameTextUsingTextId(ability, state);

  return {
    ability,
    abilityName,
    cannotDelete: Object.keys(abilities).length <= 1,
  };
};

export const useMovePage = () => {
  const { projectDataValues: moves, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('moves', 'move');
  const move: StudioMove = moves[dbSymbol];
  const moveName = getEntityNameText(move, state);

  return {
    move,
    moveName,
    cannotDelete: Object.keys(moves).length <= 1,
  };
};

export const useCreaturePage = () => {
  const { projectDataValues: creatures, selectedDataIdentifier: identifier, state } = useProjectDataReadonly('pokemon', 'pokemon');
  const creature = creatures[identifier.specie];
  const form = creature.forms.find((f) => f.form === identifier.form) || creature.forms[0];
  const creatureName = getEntityNameText(creature, state);
  const formName = useGetCreatureFormNameText()(form);

  return {
    creature,
    form,
    creatureName,
    formName,
    cannotDelete: Object.keys(creatures).length <= 1,
    canShowFemale: form.resources.hasFemale,
  };
};

export const useTextPage = () => {
  const { currentTextInfo, state } = useTextInfosReadonly();
  return {
    textInfo: currentTextInfo,
    cannotDelete: currentTextInfo.fileId >= 8997 && currentTextInfo.fileId < 300_000,
    disabledTranslation: state.projectStudio.languagesTranslation.length <= 1,
  };
};

export const useTranslationPage = (positionLanguage?: number) => {
  const { currentTextInfo, state } = useTextInfosReadonly();
  const allTextsFromFile = state.projectText[currentTextInfo.fileId];
  const allLanguageByIndex: Language[] =
    allTextsFromFile[0] &&
    allTextsFromFile[0]
      .map((element, index) => ({
        index,
        value: element,
      }))
      .filter((element) => element.value.indexOf('index') === -1 && element.value.indexOf('Index') === -1)
      .filter(({ value }) => state.projectStudio.languagesTranslation.find(({ code }) => code === value));
  const defaultLanguageIndexFromFile: Language = allLanguageByIndex.find(
    (li) => li.value === state.projectConfig.language_config.defaultLanguage
  ) ?? { value: 'en', index: 0 };
  const languageByIndexFiltered = allLanguageByIndex.filter((language) => {
    if (language.value === defaultLanguageIndexFromFile.value) return;
    return language;
  });

  return {
    state,
    defaultLanguageIndexFromFile,
    textInfo: currentTextInfo,
    allTextsFromFile,
    currentTextFromFile: allTextsFromFile[positionLanguage || 1],
    defaultLanguage: state.projectConfig.language_config.defaultLanguage,
    allLanguageByIndex,
    languageByIndexFiltered,
  };
};

export const useMapPage = () => {
  const { projectDataValues: maps, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('maps', 'map');
  const map = maps[dbSymbol];

  return {
    map,
    hasMap: dbSymbol !== '__undef__',
    hasMapModified: state.mapsModified.length !== 0,
    isRMXPMode: !state.projectStudio.isTiledMode,
    disabledOpenTiled: !state.projectStudio.isTiledMode || !map?.tiledFilename,
    state,
  };
};

export const useDexPage = () => {
  const { projectDataValues: allPokemon } = useProjectDataReadonly('pokemon', 'pokemon');
  const { projectDataValues: allDex, selectedDataIdentifier: dbSymbol } = useProjectDataReadonly('dex', 'dex');
  const dex: StudioDex = allDex[dbSymbol];
  const cannot = Object.keys(allDex).length <= 1;

  return {
    dex,
    allPokemon,
    cannotDelete: cannot,
    cannotImport: cannot,
  };
};

export const useTypePage = () => {
  const { projectDataValues: types, selectedDataIdentifier: typeSelected } = useProjectDataReadonly('types', 'type');
  const getTypeName = useGetEntityNameTextUsingTextId();
  const currentType: StudioType = types[typeSelected] || types[typeSelected];

  return {
    types,
    typeDbSymbol: typeSelected,
    currentTypeName: getTypeName(currentType),
    currentType,
  };
};

export const useItemPage = () => {
  const { projectDataValues: items, selectedDataIdentifier: itemSelected } = useProjectDataReadonly('items', 'item');
  const getItemName = useGetEntityNameText();
  const currentItem: StudioItem = items[itemSelected];

  return {
    items,
    itemDbSymbol: itemSelected,
    currentItemName: getItemName(currentItem),
    currentItem,
  };
};

export const useTrainerPage = () => {
  const { projectDataValues: trainers, selectedDataIdentifier: trainerSelected, state } = useProjectDataReadonly('trainers', 'trainer');
  const trainer = trainers[trainerSelected];
  const trainerName = getEntityNameText(trainer, state);

  return {
    trainer,
    trainerName,
    cannotDelete: Object.keys(trainers).length <= 1,
  };
};

export const useGroupPage = () => {
  const { projectDataValues: groups, selectedDataIdentifier: groupSelected, state } = useProjectDataReadonly('groups', 'group');
  const group = groups[groupSelected];
  const groupName = getEntityNameText(group, state);

  return {
    group,
    groupName,
    cannotDelete: Object.keys(groups).length <= 1,
  };
};

type OverviewCheck = 'checking' | 'available' | 'unavailable';

export const useOverviewPage = () => {
  const { map, disabledOpenTiled } = useMapPage();
  const generatingMapOverview = useGeneratingMapOverview();
  const loaderRef = useLoaderRef();
  const { t } = useTranslation('database_maps');
  const [globalState] = useGlobalState();
  const [state, setState] = useState<OverviewCheck>('checking');
  const [version, setVersion] = useState<number>(0);

  const checkMapOverview = () => {
    if (!globalState.projectPath) return;

    window.api.fileExists(
      { filePath: join(globalState.projectPath, getMapOverviewPath(map.tiledFilename)) },
      ({ result }) => (result ? setState('available') : setState('unavailable')),
      ({ errorMessage }) => {
        showNotification('danger', t('map_overview'), errorMessage);
        setState('unavailable');
      }
    );
  };

  const onClickGenerating = async () => {
    generatingMapOverview(
      { tiledFilename: map.tiledFilename },
      () => {
        loaderRef.current.close();
        setVersion((v) => v + 1);
        setState('available');
      },
      ({ errorMessage }) => loaderRef.current.setError('updating_maps_error', errorMessage, true)
    );
  };

  return {
    map,
    disabledOverview: disabledOpenTiled,
    disabledGenerating: !getSetting('tiledPath'),
    version,
    state,
    checkMapOverview,
    onClickGenerating,
  };
};

export const useNaturePage = () => {
  const { projectDataValues: natures, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('natures', 'nature');
  const nature: StudioNature = natures[dbSymbol];
  const natureName = getEntityNameText(nature, state);

  return {
    nature,
    natureName,
    cannotDelete: Object.keys(natures).length <= 1,
  };
};
