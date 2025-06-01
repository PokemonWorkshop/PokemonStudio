import type { ZodSchema } from 'zod';
import { pushTextError, setEntities, setEntityList, setTexts, type Entity, type EntityError, type EntityRecord } from './state';
import path from 'path';
import fs from 'fs/promises';
import { safeParseJSON } from '@utils/json/parse';
import { loadAllEntityTexts } from './loadTextOfEntities';

export type EntityRegistryEntry = { pathGlob: string; validator: ZodSchema };
const entityRegistry: Record<string, EntityRegistryEntry[]> = {};

export const registerEntity = <T>(entityType: string, pathGlob: `${string}.json`, validator: ZodSchema<T>) => {
  entityRegistry[entityType] ??= [];
  entityRegistry[entityType].push({ pathGlob, validator });
};

export const getAllEntityTypes = () => Object.keys(entityRegistry);
export const getEntityRegistry = (entityType: string) => entityRegistry[entityType];

export const loadAllEntities = async (
  projectPath: string,
  mainLanguage: string,
  progress: (entityType: string, step: number, total: number) => void
) => {
  const entityTypes = getAllEntityTypes();
  for (const entityType of entityTypes) {
    progress(entityType, entityTypes.indexOf(entityType) + 1, entityTypes.length);
    const data = await loadAllEntityOfType(entityType, projectPath);
    setEntities(entityType, data.entities, data.errors);
    const texts = await loadAllEntityTexts(entityType, projectPath, mainLanguage, data.entityList); // Should load the CSV files (texts) and build the initial entityLists
    texts.forEach((result) => {
      if (result.status === 'rejected') {
        pushTextError(result.reason);
        return;
      }
      result.value.handlers.forEach(([key, handler]) => setTexts(key, handler));
      if (result.value.entityList) setEntityList(result.value.entityListKey, result.value.entityList);
    });
  }
};

type EntityListEntry = readonly [dbSymbol: string, data: Entity];
type LoadedEntityRecord = { entities: EntityRecord; entityList: EntityListEntry[]; errors: EntityError[] };
type DBSymbolWithFilename = { dbSymbol: string; filename: string };

export const filterAndTransformEntityFilenames = (filenames: string[]): DBSymbolWithFilename[] =>
  filenames.map((v) => ({ dbSymbol: path.basename(v).split('.')[0], filename: v })).filter(({ dbSymbol }) => !dbSymbol.startsWith('.'));

const loadAllEntityOfType = async (entityType: string, projectPath: string): Promise<LoadedEntityRecord> => {
  const registry = entityRegistry[entityType];
  if (!registry) throw new Error(`No entity of type ${entityType} was ever registered through registerEntity`);

  const result = await registry.reduce<Promise<LoadedEntityRecord>>(async (prev, curr) => {
    const prevData = await prev;
    const filenames = await getFilenames(curr.pathGlob, projectPath);
    const filesToLoad = filterAndTransformEntityFilenames(filenames); // In unlucky case, add this: .filter((f) => !prevData.entities[f.dbSymbol]);

    for (const { dbSymbol, filename } of filesToLoad) {
      const data = await fs.readFile(filename, { encoding: 'utf-8' });
      const parsedData = safeParseJSON(curr.validator, data, filename);
      if (parsedData.success) {
        prevData.entities[dbSymbol] = parsedData.data;
        prevData.entityList.push([dbSymbol, parsedData.data]);
      } else {
        prevData.errors.push({ dbSymbol, entityType, error: parsedData.error });
      }
    }

    return prevData;
  }, Promise.resolve({ entities: {}, entityList: [], errors: [] }));

  return result;
};

const getFilenames = async (glob: string, projectPath: string) => {
  if (glob.includes('*')) {
    const [dirName, endFile] = glob.split('*', 2);
    const pathToRead = path.join(projectPath, dirName);
    const allFiles = await fs.readdir(pathToRead);
    return allFiles.filter((filename) => filename.endsWith(endFile)).map((filename) => path.join(pathToRead, filename));
  }

  return [path.join(projectPath, glob)];
};

export const validateEntity = (type: string, dbSymbol: string, entity: unknown): Entity => {
  const validators = entityRegistry[type];
  if (!validators) throw new Error(`No entity registered for type ${type}`);

  const entityPathEnd = `/${dbSymbol}.json`;

  const specialValidator = validators.find((v) => v.pathGlob.endsWith(entityPathEnd))?.validator;
  if (specialValidator) return specialValidator.parse(entity);

  const defaultValidator = validators.find((v) => v.pathGlob.includes('*'))?.validator;
  if (defaultValidator) return defaultValidator.parse(entity);

  throw new Error(`No validator matches for ${dbSymbol} entity of type ${type}`);
};
