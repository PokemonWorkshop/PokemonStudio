import type { StudioAbility } from '@modelEntities/ability';
import type {
  SoundDesignConfig,
  StudioCreditConfig,
  StudioDevicesConfig,
  StudioDisplayConfig,
  StudioGameOptionConfig,
  StudioGraphicConfig,
  StudioInfoConfig,
  StudioLanguageConfig,
  StudioSaveConfig,
  StudioSceneTitleConfig,
  StudioSettingConfig,
  StudioTextConfig,
} from '@modelEntities/config';
import type { StudioCreature } from '@modelEntities/creature';
import type { DbSymbol } from '@modelEntities/dbSymbol';
import type { StudioDex } from '@modelEntities/dex';
import type { StudioEvent } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE, type StudioEventTree } from '@modelEntities/event/event-tree';
import type { StudioGroup } from '@modelEntities/group';
import type { StudioItem } from '@modelEntities/item';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapInfo } from '@modelEntities/mapInfo';
import type { StudioMapLink } from '@modelEntities/mapLink';
import type { StudioMove } from '@modelEntities/move';
import type { StudioNature } from '@modelEntities/nature';
import type { StudioProject, StudioProjectLanguageTranslation } from '@modelEntities/project';
import type { StudioQuest } from '@modelEntities/quest';
import type { StudioTextInfo } from '@modelEntities/textInfo';
import type { StudioTrainer } from '@modelEntities/trainer';
import type { StudioTrainerClass } from '@modelEntities/trainerClass';
import type { StudioType } from '@modelEntities/type';
import type { StudioZone } from '@modelEntities/zone';
import type { PSDKVersion } from '@services/getPSDKVersion';
import { SavingConfigMap, SavingMap, SavingTextMap } from '@utils/SavingUtils';
import { useState } from 'react';
import { createContainer } from 'react-tracked';

export interface ProjectData {
  items: {
    [item: string]: StudioItem;
  };
  moves: {
    [move: string]: StudioMove;
  };
  pokemon: {
    [pokemon: string]: StudioCreature;
  };
  quests: {
    [quest: string]: StudioQuest;
  };
  trainerClasses: {
    [trainerClass: string]: StudioTrainerClass;
  };
  trainers: {
    [trainer: string]: StudioTrainer;
  };
  types: {
    [type: string]: StudioType;
  };
  zones: {
    [zone: string]: StudioZone;
  };
  abilities: {
    [ability: string]: StudioAbility;
  };
  groups: {
    [group: string]: StudioGroup;
  };
  dex: {
    [dex: string]: StudioDex;
  };
  mapLinks: {
    [mapLink: string]: StudioMapLink;
  };
  maps: {
    [map: string]: StudioMap;
  };
  natures: {
    [nature: string]: StudioNature;
  };
  events: {
    [event: string]: StudioEvent;
  };
}

export interface ProjectText {
  [fileId: number]: string[][];
}

export const psdkConfigKeys: (keyof PSDKConfigs)[] = [
  'credits_config',
  'devices_config',
  'display_config',
  'graphic_config',
  'sound_design_config',
  'infos_config',
  'language_config',
  'save_config',
  'scene_title_config',
  'settings_config',
  'texts_config',
  'game_options_config',
];

export interface PSDKConfigs {
  credits_config: StudioCreditConfig;
  devices_config: StudioDevicesConfig;
  display_config: StudioDisplayConfig;
  graphic_config: StudioGraphicConfig;
  sound_design_config: SoundDesignConfig;
  infos_config: StudioInfoConfig;
  language_config: StudioLanguageConfig;
  save_config: StudioSaveConfig;
  scene_title_config: StudioSceneTitleConfig;
  settings_config: StudioSettingConfig;
  texts_config: StudioTextConfig;
  game_options_config: StudioGameOptionConfig;
}

export type SelectedDataIdentifier = {
  pokemon: {
    specie: string;
    form: number;
  };
  move: string;
  item: string;
  quest: string;
  trainerClass: string;
  trainer: string;
  type: string;
  zone: string;
  ability: string;
  group: string;
  dex: string;
  mapLink: string;
  map: string;
  textInfo: number;
  nature: string;
  event: string;
};

export interface State {
  projectPath: string | null;
  projectData: ProjectData;
  projectText: ProjectText;
  projectStudio: StudioProject;
  projectConfig: PSDKConfigs;
  selectedDataIdentifier: SelectedDataIdentifier;
  savingData: SavingMap;
  savingConfig: SavingConfigMap;
  savingText: SavingTextMap;
  savingProjectStudio: boolean;
  currentPSDKVersion: PSDKVersion;
  lastPSDKVersion: PSDKVersion;
  textInfos: StudioTextInfo[];
  textVersion: number;
  mapInfo: StudioMapInfo;
  eventTree: StudioEventTree;
  savingLanguage: string[];
  savingTextInfos: boolean;
  savingMapInfo: boolean;
  savingEventTree: boolean;
  mapsModified: DbSymbol[];
}

const initialState = {
  selectedDataIdentifier: {
    pokemon: {
      specie: 'bulbasaur',
      form: 0,
    },
    move: 'pound',
    item: 'master_ball',
    quest: 'quest_0',
    trainerClass: 'youngster',
    trainer: 'trainer_0',
    type: 'normal',
    zone: 'zone_0',
    ability: 'overgrow',
    group: 'group_0',
    dex: 'national',
    mapLink: '__undef__',
    map: 'map001',
    textInfo: 0,
    nature: 'adamant',
    event: 'event_0',
  },
  savingData: new SavingMap(),
  savingConfig: new SavingConfigMap(),
  savingText: new SavingTextMap(),
  textInfos: [] as StudioTextInfo[],
  mapInfo: {} as StudioMapInfo,
  eventTree: DEFAULT_EVENT_TREE,
  savingProjectStudio: false,
  savingLanguage: [] as string[],
  savingTextInfos: false,
  savingMapInfo: false,
  savingEventTree: false,
  textVersion: 0,
  mapsModified: [] as DbSymbol[],
};

export type TextsWithLanguageConfig = {
  texts: ProjectText;
  languages: StudioProjectLanguageTranslation[];
  defaultLanguage: string;
};

const useMyState = () => useState(initialState as State);

export const { Provider: GlobalStateProvider, useTracked: useGlobalState } = createContainer(useMyState);

export const useGlobalSelectedDataIdentifier = (): [SelectedDataIdentifier, (selectedDataIdentifier: Partial<SelectedDataIdentifier>) => void] => {
  const [state, setState] = useGlobalState();
  const setGlobalSelectedDataIdentifier = (selectedDataIdentifier: Partial<SelectedDataIdentifier>) =>
    setState({ ...state, selectedDataIdentifier: { ...state.selectedDataIdentifier, ...selectedDataIdentifier } });

  return [state.selectedDataIdentifier, setGlobalSelectedDataIdentifier];
};
