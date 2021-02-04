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
  [other: string]: {
    [k: string]: PSDKEntity;
  };
}

export interface State {
  projectPath: string | null;
  projectData: ProjectData;
}

const initialState = {};

const useMyState = () => useState(initialState as State);

export const {
  Provider: GlobalStateProvider,
  useTracked: useGlobalState,
} = createContainer(useMyState);
