import type { ZodObject, ZodRawShape } from 'zod';
import { setEntities, type Entity, type EntityError, type EntityRecord } from './state';
import path from 'path';
import fs from 'fs/promises';
import { safeParseJSON } from '@utils/json/parse';

type EntityTextDescription = {
  propertyInEntity: string;
  textFilename?: string;
  discriminator: string | ((entity: Entity) => number);
  dbSymbol?: string;
  pathToProperties?: (string | NumberConstructor)[];
};

const entityRegistry: Record<string, { pathGlob: string; validator: ZodObject<ZodRawShape> }[]> = {};
const entityTextRegistry: Record<string, EntityTextDescription[]> = {};

export const registerEntity = <T extends ZodRawShape>(entityType: string, pathGlob: `${string}.json`, validator: ZodObject<T>) => {
  entityRegistry[entityType] ??= [];
  entityRegistry[entityType].push({ pathGlob, validator });
};

export const registerEntityText = (entityType: string, description: EntityTextDescription) => {
  entityTextRegistry[entityType] ??= [];
  entityTextRegistry[entityType].push(description);
};

const getAllEntityTypeToLoad = () => Object.keys(entityRegistry);

export const loadAllEntities = async (projectPath: string, progress: (entityType: string, step: number, total: number) => void) => {
  const entityTypes = getAllEntityTypeToLoad();
  for (const entityType of entityTypes) {
    progress(entityType, entityTypes.indexOf(entityType), entityTypes.length);
    const data = await loadAllEntityOfType(entityType, projectPath);
    setEntities(entityType, data.entities, data.errors);
    const texts = await loadAllEntityTexts(entityType, projectPath, data.entityList); // Should load the CSV files (texts) and build the initial entityLists
    // Push the text to state
  }
};

type LoadedEntityRecord = { entities: EntityRecord; entityList: (readonly [dbSymbol: string, data: Entity])[]; errors: EntityError[] };

const loadAllEntityOfType = async (entityType: string, projectPath: string): Promise<LoadedEntityRecord> => {
  const registry = entityRegistry[entityType];
  if (!registry) throw new Error(`No entity of type ${entityType} was ever registered through registerEntity`);

  const orderedRegistry = registry
    .filter(({ pathGlob }) => !pathGlob.includes('*'))
    .concat(registry.filter(({ pathGlob }) => pathGlob.includes('*')));

  const loaded = await orderedRegistry.reduce(async (prev, curr) => {
    const prevData = await prev;
    const filenames = await getFilenames(curr.pathGlob, projectPath);
    const filesToLoad = filenames
      .map((v) => ({ dbSymbol: path.basename(v).split('.')[0], filename: v }))
      .filter(({ dbSymbol }) => !dbSymbol.startsWith('.') && !prevData.find((v) => v.dbSymbol === dbSymbol));

    const loadedData = await Promise.all(
      filesToLoad.map(async ({ dbSymbol, filename }) => {
        const data = await fs.readFile(filename, { encoding: 'utf-8' });
        const parsedData = safeParseJSON(curr.validator, data, filename);
        if (parsedData.success) return { dbSymbol, data: parsedData.data };

        return { dbSymbol, entityType, error: parsedData.error };
      })
    );

    return prevData.concat(loadedData);
  }, Promise.resolve([] as ({ dbSymbol: string; data: Entity } | EntityError)[]));

  const entities = loaded.filter((e): e is Exclude<typeof e, EntityError> => 'data' in e).map(({ dbSymbol, data }) => [dbSymbol, data] as const);
  const errors = loaded.filter((e): e is Extract<typeof e, EntityError> => 'data' in e);
  return { entities: Object.fromEntries(entities), entityList: entities, errors };
};

const getFilenames = async (glob: string, projectPath: string) => {
  if (glob.includes('*')) {
    const [dirName, endFile] = glob.split('*', 2);
    const pathToRead = path.join(projectPath, dirName);
    const allFiles = await fs.readdir(pathToRead);
    return allFiles.filter((filename) => filename.endsWith(endFile));
  }

  return [path.join(projectPath, glob)];
};
