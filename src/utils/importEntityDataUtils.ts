import { StudioTrainer } from '@modelEntities/trainer';
import { StudioMove } from '@modelEntities/move';
import { cloneEntity } from './cloneEntity';

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
