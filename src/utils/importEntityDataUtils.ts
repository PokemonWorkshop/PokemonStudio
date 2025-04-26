import { StudioTrainer } from '@modelEntities/trainer';
import { StudioMove } from '@modelEntities/move';
import { StudioCreature } from '@modelEntities/creature';
import { cloneEntity } from './cloneEntity';
import { findFirstAvailableFormTextId } from './ModelUtils';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioItem } from '@modelEntities/item';
import { StudioQuest } from '@modelEntities/quest';
import { StudioGroup } from '@modelEntities/group';

export const importTrainerData = (trainer: StudioTrainer, dataToImport: StudioTrainer): StudioTrainer => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...trainer,
    bagEntries: cloneData.bagEntries,
    party: cloneData.party,
    additionalDialogs: cloneData.additionalDialogs,
    resources: cloneData.resources,
  };
};

export const importMoveData = (move: StudioMove, dataToImport: StudioMove): StudioMove => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...cloneData,
    id: move.id,
    dbSymbol: move.dbSymbol,
    type: move.type,
    category: move.category,
  };
};

export const importCreatureData = (creature: StudioCreature, dataToImport: StudioCreature, allPokemon: ProjectData['pokemon']): StudioCreature => {
  const cloneData = cloneEntity(dataToImport);

  const newCreature = {
    ...creature,
    forms: cloneData.forms,
  };

  newCreature.forms[0].type1 = creature.forms[0].type1;
  newCreature.forms[0].type2 = creature.forms[0].type2;
  newCreature.forms[0].formTextId.name = findFirstAvailableFormTextId(allPokemon, 0, 'name');

  const newAllPokemon = {
    ...allPokemon,
    [newCreature.dbSymbol]: newCreature,
  }; //To avoid getting same text IDs for other forms

  //Update form text IDs
  newCreature.forms.slice(1).forEach((form) => {
    const formTextIdName = findFirstAvailableFormTextId(newAllPokemon, 0, 'name');
    const formTextIdDescription = findFirstAvailableFormTextId(newAllPokemon, 0, 'description');
    form.formTextId.name = formTextIdName;
    form.formTextId.description = formTextIdDescription;
  });

  return newCreature;
};

export const importItemData = (item: StudioItem, dataToImport: StudioItem): StudioItem => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...cloneData,
    id: item.id,
    dbSymbol: item.dbSymbol,
  };
};

export const importQuestData = (quest: StudioQuest, dataToImport: StudioQuest): StudioQuest => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...cloneData,
    id: quest.id,
    dbSymbol: quest.dbSymbol,
    isPrimary: quest.isPrimary,
  };
};

export const importGroupData = (group: StudioGroup, dataToImport: StudioGroup): StudioGroup => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...group,
    isHordeBattle: cloneData.isHordeBattle,
    encounters: cloneData.encounters,
  };
};
