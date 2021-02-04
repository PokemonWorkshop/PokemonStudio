import log from 'electron-log';
import { entitiesSerializer } from '../models/entities';
import PSDKEntity from '../models/entities/PSDKEntity';

export const deserialize = (obj: PSDKEntity) => {
  if (entitiesSerializer[obj.klass]) {
    return entitiesSerializer[obj.klass].parse(obj);
  }
  log.warn(`Unknown class ${obj.klass}.`);
  return undefined;
};
