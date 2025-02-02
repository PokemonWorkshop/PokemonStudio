import { StudioTrainer } from '@modelEntities/trainer';

export const importTrainerData = (trainer: StudioTrainer, dataToImport: StudioTrainer): StudioTrainer => {
  return {
    ...trainer,
    bagEntries: dataToImport.bagEntries,
    party: dataToImport.party,
    additionalDialogs: dataToImport.additionalDialogs,
    resources: dataToImport.resources,
  };
};
