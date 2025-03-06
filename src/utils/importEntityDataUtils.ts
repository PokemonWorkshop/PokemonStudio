import { StudioTrainer } from '@modelEntities/trainer';
import { StudioCreature } from '@modelEntities/creature';
import { cloneEntity } from './cloneEntity';
import { findFirstAvailableFormTextId } from './ModelUtils';
import { ProjectData } from '@src/GlobalStateProvider';

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

export const importCreatureData = (creature: StudioCreature, dataToImport: StudioCreature, allPokemon: ProjectData['pokemon']): StudioCreature => {
  const cloneData = cloneEntity(dataToImport);

  const newCreature = {
    ...creature,
    forms: cloneData.forms,
  };

  newCreature.forms[0].type1 = creature.forms[0].type1;
  newCreature.forms[0].type2 = creature.forms[0].type2;
  newCreature.forms[0].formTextId.name = findFirstAvailableFormTextId(allPokemon, 0, 'name');

  let newAllPokemon = {
    ...allPokemon,
    [newCreature.dbSymbol]: newCreature,
  }; //To avoid getting same text IDs for other forms

  //Update form text IDs
  for (let i = 1; i < newCreature.forms.length; i++) {
    const formTextIdName = findFirstAvailableFormTextId(newAllPokemon, 0, 'name');
    const formTextIdDescription = findFirstAvailableFormTextId(newAllPokemon, 0, 'description');
    newCreature.forms[i].formTextId.name = formTextIdName;
    newCreature.forms[i].formTextId.description = formTextIdDescription;

    newAllPokemon = {
      ...allPokemon,
      [newCreature.dbSymbol]: newCreature,
    }; //To avoid getting same text IDs for other forms
  }

  return newCreature;
};
