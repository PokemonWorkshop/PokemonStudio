import { useState } from 'react';
import { createContainer } from 'react-tracked';
import ItemModel from './models/entities/item/Item.model';
import MoveModel from './models/entities/move/Move.model';
import PokemonModel from './models/entities/pokemon/Pokemon.model';
import QuestModel from './models/entities/quest/Quest.model';
import TrainerModel from './models/entities/trainer/Trainer.model';
import TypeModel from './models/entities/type/Type.model';
import ZoneModel from './models/entities/zone/Zone.model';
import PSDKEntity from './models/entities/PSDKEntity';
import AbilityModel from '@modelEntities/ability/Ability.model';
import { SavingConfigMap, SavingMap } from '@utils/SavingUtils';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import GroupModel from '@modelEntities/group/Group.model';
import CreditsConfigModel from '@modelEntities/config/CreditsConfig.model';
import DevicesConfigModel from '@modelEntities/config/DevicesConfig.model';
import DisplayConfigModel from '@modelEntities/config/DisplayConfig.model';
import GraphicConfigModel from '@modelEntities/config/GraphicConfig.model';
import InfosConfigModel from '@modelEntities/config/InfosConfig.model';
import LanguageConfigModel from '@modelEntities/config/LanguageConfig.model';
import SaveConfigModel from '@modelEntities/config/SaveConfig.model';
import SceneTitleConfigModel from '@modelEntities/config/SceneTitleConfig.model';
import SettingsConfigModel from '@modelEntities/config/SettingsConfig.model';
import TextsConfigModel from '@modelEntities/config/TextsConfig.model';
import type { PSDKVersion } from '@services/getPSDKVersion';
import NaturesConfigModel from '@modelEntities/config/NaturesConfig.model';
import DexModel from '@modelEntities/dex/Dex.model';
import GameOptionsConfigModel from '@modelEntities/config/GameOptionsConfig.model';
import MapLinkModel from '@modelEntities/maplinks/MapLink.model';
import { RMXPMap } from '@modelEntities/maplinks/RMXPMap';

export enum StudioShortcut {
  DB_PREVIOUS = 'db_previous',
  DB_NEXT = 'db_next',
}

export interface ProjectData {
  items: {
    [item: string]: ItemModel;
  };
  moves: {
    [move: string]: MoveModel;
  };
  pokemon: {
    [pokemon: string]: PokemonModel;
  };
  quests: {
    [quest: string]: QuestModel;
  };
  trainers: {
    [trainer: string]: TrainerModel;
  };
  types: {
    [type: string]: TypeModel;
  };
  zones: {
    [zone: string]: ZoneModel;
  };
  abilities: {
    [ability: string]: AbilityModel;
  };
  groups: {
    [group: string]: GroupModel;
  };
  dex: {
    [dex: string]: DexModel;
  };
  mapLinks: {
    [mapLink: string]: MapLinkModel;
  };
  [other: string]: {
    [k: string]: PSDKEntity;
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
  credits_config: CreditsConfigModel;
  devices_config: DevicesConfigModel;
  display_config: DisplayConfigModel;
  graphic_config: GraphicConfigModel;
  infos_config: InfosConfigModel;
  language_config: LanguageConfigModel;
  save_config: SaveConfigModel;
  scene_title_config: SceneTitleConfigModel;
  settings_config: SettingsConfigModel;
  texts_config: TextsConfigModel;
  game_options_config: GameOptionsConfigModel;
  natures: NaturesConfigModel;
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
  projectStudio: ProjectStudioModel;
  projectConfig: PSDKConfigs;
  selectedDataIdentifier: SelectedDataIdentifier;
  savingData: SavingMap;
  savingConfig: SavingConfigMap;
  savingProjectStudio: boolean;
  currentPSDKVersion: PSDKVersion;
  lastPSDKVersion: PSDKVersion;
  rmxpMaps: RMXPMap[];
  tmpHackHasTextToSave?: boolean;
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
  rmxpMaps: [] as RMXPMap[],
  savingProjectStudio: false,
  savingLanguage: [] as string[],
  savingImage: {},
};

export type TextsWithLanguageConfig = {
  texts: ProjectText;
  config: LanguageConfigModel;
};

const useMyState = () => useState(initialState as State);

export const { Provider: GlobalStateProvider, useTracked: useGlobalState } = createContainer(useMyState);

export const useGlobalSelectedDataIdentifier = (): [SelectedDataIdentifier, (selectedDataIdentifier: Partial<SelectedDataIdentifier>) => void] => {
  const [state, setState] = useGlobalState();
  const setGlobalSelectedDataIdentifier = (selectedDataIdentifier: Partial<SelectedDataIdentifier>) =>
    setState({ ...state, selectedDataIdentifier: { ...state.selectedDataIdentifier, ...selectedDataIdentifier } });

  return [state.selectedDataIdentifier, setGlobalSelectedDataIdentifier];
};
