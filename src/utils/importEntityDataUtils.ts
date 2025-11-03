import { StudioTrainer } from '@modelEntities/trainer';
import { StudioMove } from '@modelEntities/move';
import { StudioCreature } from '@modelEntities/creature';
import { cloneEntity } from './cloneEntity';
import { findFirstAvailableFormTextId, findFirstAvailableCustomObjectiveTextId } from './ModelUtils';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioItem } from '@modelEntities/item';
import { StudioQuest, StudioQuestObjective } from '@modelEntities/quest';
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
    condition: move.condition,
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
  }; // To avoid getting same text IDs for other forms

  // Update form text IDs
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

export const importQuestData = (quest: StudioQuest, dataToImport: StudioQuest, allQuests: ProjectData['quests']): StudioQuest => {
  const cloneData = cloneEntity(dataToImport);

  const newQuest = {
    ...quest,
    resolution: cloneData.resolution,
    objectives: cloneData.objectives,
    earnings: cloneData.earnings,
  };

  const newAllQuests = {
    ...allQuests,
    [newQuest.dbSymbol]: newQuest,
  }; // To avoid getting same text IDs for custom objectives

  newQuest.objectives.forEach((objective) => {
    if (objective.objectiveMethodName === 'objective_custom') {
      const customTextId = findFirstAvailableCustomObjectiveTextId(newAllQuests, 0);
      objective.objectiveMethodArgs[1] = customTextId;
    }
  });

  return newQuest;
};

export const importQuestObjectivesData = (
  quest: StudioQuest,
  dataToImport: StudioQuestObjective[],
  allQuests: ProjectData['quests']
): StudioQuest => {
  const cloneData = cloneEntity(dataToImport);

  const newQuest = {
    ...quest,
    objectives: cloneData,
  };

  const newAllQuests = {
    ...allQuests,
    [newQuest.dbSymbol]: newQuest,
  }; // To avoid getting same text IDs for custom objectives

  newQuest.objectives.forEach((objective) => {
    if (objective.objectiveMethodName === 'objective_custom') {
      const customTextId = findFirstAvailableCustomObjectiveTextId(newAllQuests, 0);
      objective.objectiveMethodArgs[1] = customTextId;
    }
  });

  return newQuest;
};

export const importGroupData = (group: StudioGroup, dataToImport: StudioGroup): StudioGroup => {
  const cloneData = cloneEntity(dataToImport);

  return {
    ...group,
    encounters: cloneData.encounters,
  };
};
