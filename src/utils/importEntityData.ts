export const importEntityData = <T extends object>(entity: T, dataToImport: Partial<T>): T => {
  if (!('klass' in entity)) return entity;

  let fieldsToUpdate = [];

  switch (entity.klass) {
    case 'TrainerBattleSetup':
      fieldsToUpdate = ['bagEntries', 'party', 'additionalDialogs', 'resources'] as (keyof T)[];
      break;
    //TODO add other entities fields to import
    default:
      return entity;
  }

  return {
    ...entity,
    ...fieldsToUpdate.reduce((acc, key) => {
      if (dataToImport[key] !== undefined) {
        acc[key] = dataToImport[key];
      }
      return acc;
    }, {} as Partial<T>),
  };
};
