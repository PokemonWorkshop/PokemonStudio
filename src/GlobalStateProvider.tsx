import { useState } from 'react';
import { createContainer } from 'react-tracked';
import { SavingConfigMap, SavingMap } from '@utils/SavingUtils';
import type { PSDKVersion } from '@services/getPSDKVersion';
import { StudioAbility } from '@modelEntities/ability';
import {
  StudioCreditConfig,
  StudioDevicesConfig,
  StudioDisplayConfig,
  StudioGameOptionConfig,
  StudioGraphicConfig,
  StudioInfoConfig,
  StudioLanguageConfig,
  StudioNatureConfig,
  StudioSaveConfig,
  StudioSceneTitleConfig,
  StudioSettingConfig,
  StudioTextConfig,
} from '@modelEntities/config';
import { StudioDex } from '@modelEntities/dex';
import { StudioCreature } from '@modelEntities/creature';
import { StudioItem } from '@modelEntities/item';
import { StudioMove } from '@modelEntities/move';
import { StudioGroup } from '@modelEntities/group';
import { StudioTrainer } from '@modelEntities/trainer';
import { StudioMapLink, StudioRMXPMap } from '@modelEntities/mapLink';
import { StudioZone } from '@modelEntities/zone';
import { StudioType } from '@modelEntities/type';
import { StudioQuest } from '@modelEntities/quest';
import { StudioProject } from '@modelEntities/project';

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
}

export const projectTextKeys: (keyof ProjectText)[] = [
  9001, 100000, 100001, 100002, 100003, 100004, 100005, 100006, 100007, 100008, 100010, 100012, 100013, 100015, 100029, 100045, 100046, 100047,
  100048, 100061, 100062, 100063, 100064,
];

export const projectTextSave: boolean[] = new Array(projectTextKeys.length).fill(false);

export interface ProjectText {
  9001: string[][]; // Items plural names
  100000: string[][]; // Pokémon names
  100001: string[][]; // Pokémon species
  100002: string[][]; // Pokémon descriptions
  100003: string[][]; // Types names
  100004: string[][]; // Abilities names
  100005: string[][]; // Abilities descriptions
  100006: string[][]; // Moves names
  100007: string[][]; // Moves descriptions
  100008: string[][]; // Natures names
  100010: string[][]; // Zones names
  100012: string[][]; // Items names
  100013: string[][]; // Items descriptions
  100015: string[][]; // Bag pockets names
  100029: string[][]; // Trainers class names
  100045: string[][]; // Quests names
  100046: string[][]; // Quests descriptions
  100047: string[][]; // Victory sentences (trainer)
  100048: string[][]; // Defeat sentences (trainer)
  100061: string[][]; // Groups names
  100062: string[][]; // Trainers names
  100063: string[][]; // Pokédex
  100064: string[][]; // Zone descriptions
}

export const psdkConfigKeys: (keyof PSDKConfigs)[] = [
  'credits_config',
  'devices_config',
  'display_config',
  'graphic_config',
  'infos_config',
  'language_config',
  'save_config',
  'scene_title_config',
  'settings_config',
  'texts_config',
  'game_options_config',
  'natures',
];

export interface PSDKConfigs {
  credits_config: StudioCreditConfig;
  devices_config: StudioDevicesConfig;
  display_config: StudioDisplayConfig;
  graphic_config: StudioGraphicConfig;
  infos_config: StudioInfoConfig;
  language_config: StudioLanguageConfig;
  save_config: StudioSaveConfig;
  scene_title_config: StudioSceneTitleConfig;
  settings_config: StudioSettingConfig;
  texts_config: StudioTextConfig;
  game_options_config: StudioGameOptionConfig;
  natures: StudioNatureConfig;
}

export type SelectedDataIdentifier = {
  pokemon: {
    specie: string;
    form: number;
  };
  move: string;
  item: string;
  quest: string;
  trainer: string;
  type: string;
  zone: string;
  ability: string;
  group: string;
  dex: string;
  mapLink: string;
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
  savingProjectStudio: boolean;
  currentPSDKVersion: PSDKVersion;
  lastPSDKVersion: PSDKVersion;
  rmxpMaps: StudioRMXPMap[];
  tmpHackHasTextToSave?: boolean;
  textVersion: number;
  savingLanguage: string[];
  savingImage: { [path: string]: string };
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
    trainer: 'trainer_0',
    type: 'normal',
    zone: 'zone_0',
    ability: 'overgrow',
    group: 'group_0',
    dex: 'national',
    mapLink: '__undef__',
  },
  savingData: new SavingMap(),
  savingConfig: new SavingConfigMap(),
  rmxpMaps: [] as StudioRMXPMap[],
  savingProjectStudio: false,
  savingLanguage: [] as string[],
  savingImage: {},
  textVersion: 0,
};

export type TextsWithLanguageConfig = {
  texts: ProjectText;
  config: StudioLanguageConfig;
};

const useMyState = () => useState(initialState as State);

export const { Provider: GlobalStateProvider, useTracked: useGlobalState } = createContainer(useMyState);

export const useGlobalSelectedDataIdentifier = (): [SelectedDataIdentifier, (selectedDataIdentifier: Partial<SelectedDataIdentifier>) => void] => {
  const [state, setState] = useGlobalState();
  const setGlobalSelectedDataIdentifier = (selectedDataIdentifier: Partial<SelectedDataIdentifier>) =>
    setState({ ...state, selectedDataIdentifier: { ...state.selectedDataIdentifier, ...selectedDataIdentifier } });

  return [state.selectedDataIdentifier, setGlobalSelectedDataIdentifier];
};
