import LanguageConfigModel from '@modelEntities/config/LanguageConfig.model';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import PSDKConfig from '@modelEntities/PSDKConfig';
import PSDKConfigModel from '@modelEntities/PSDKConfig.model';
import { ProjectText } from '@src/GlobalStateProvider';
import log from 'electron-log';
import { TypedJSON } from 'typedjson';
import { entitiesConfigSerializer, entitiesSerializer } from '../models/entities';
import PSDKEntity from '../models/entities/PSDKEntity';

const deserialize = (obj: PSDKEntity) => {
  if (entitiesSerializer[obj.klass]) {
    return entitiesSerializer[obj.klass].parse(obj);
  }
  log.warn(`Unknown class ${obj.klass}.`);
  return undefined;
};

export const serialize = (obj: PSDKEntity) => {
  if (entitiesSerializer[obj.klass]) {
    entitiesSerializer[obj.klass].config({ indent: 2 });
    return entitiesSerializer[obj.klass].stringify(obj);
  }
  log.warn(`Unknown class ${obj.klass}.`);
  return undefined;
};

const deserializeEntry = (entry: PSDKEntity, projectText: ProjectText, languageConfig: LanguageConfigModel) => {
  const deserializedEntry = deserialize(entry);
  if (!deserializedEntry) return entry;

  deserializedEntry.projectText = { texts: projectText, config: languageConfig };
  return deserializedEntry;
};

export const deserializeDataEntries = <T extends PSDKEntity>(
  entries: Record<string, T>,
  projectText: ProjectText,
  languageConfig: LanguageConfigModel
): Record<string, T> =>
  Object.fromEntries(Object.entries(entries).map(([entryKey, entry]) => [entryKey, deserializeEntry(entry, projectText, languageConfig) as T]));

export const deserializeDataArray = <T extends PSDKEntity>(
  data: string[],
  projectText: ProjectText,
  languageConfig: LanguageConfigModel
): Record<string, T> =>
  Object.fromEntries(data.map<T>((s) => JSON.parse(s)).map((entry) => [entry.dbSymbol, deserializeEntry(entry, projectText, languageConfig) as T]));

export const deserializeProjectStudio = (projectStudioData: string) => {
  const serializer = new TypedJSON(ProjectStudioModel);
  return serializer.parse(projectStudioData);
};

export const serializeProjectStudio = (projectStudio: ProjectStudioModel) => {
  const serializer = new TypedJSON(ProjectStudioModel);
  serializer.config({ indent: 2 });
  return serializer.stringify(projectStudio);
};

/* remove this later */
export const deserializePSDKConfig = (psdkConfig: string) => {
  const serializer = new TypedJSON(PSDKConfigModel);
  return serializer.parse(psdkConfig);
};

export const serializeLanguageConfig = (languageConfig: LanguageConfigModel) => {
  const serializer = new TypedJSON(LanguageConfigModel);
  serializer.config({ indent: 2 });
  return serializer.stringify(languageConfig);
};

export const deserializeConfig = <T extends PSDKConfig>(obj: PSDKConfig) => {
  if (entitiesConfigSerializer[obj.klass]) {
    return (entitiesConfigSerializer[obj.klass].parse(obj) || obj) as T;
  }
  log.warn(`Unknown class ${obj.klass}.`);
  return obj as T;
};

export const serializeConfig = (obj: PSDKConfig) => {
  if (entitiesConfigSerializer[obj.klass]) {
    entitiesConfigSerializer[obj.klass].config({ indent: 2 });
    return entitiesConfigSerializer[obj.klass].stringify(obj as PSDKConfig);
  }
  log.warn(`Unknown class ${obj.klass}.`);
  return undefined;
};
