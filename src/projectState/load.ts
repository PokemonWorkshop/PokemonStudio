import type { ZodObject, ZodRawShape } from 'zod';
import { setEntities, setEntityList, setTexts, type Entity, type EntityError, type EntityRecord } from './state';
import path from 'path';
import fs from 'fs/promises';
import { safeParseJSON } from '@utils/json/parse';
import { CSVHandler, loadCSV } from './text';
import type { SelectOption } from '@ds/Select/types';

type EntityTextDescription = {
  propertyInEntity: string;
  textFileId?: number;
  textIsSystemFile?: boolean;
  discriminator: string | ((entity: Entity) => number);
  // dbSymbol?: string; // Removed to simplify the problem
  // pathToProperties?: (string | NumberConstructor)[]; // Removed to simplify the problem
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

export const loadAllEntities = async (
  projectPath: string,
  mainLanguage: string,
  progress: (entityType: string, step: number, total: number) => void
) => {
  const entityTypes = getAllEntityTypeToLoad();
  for (const entityType of entityTypes) {
    progress(entityType, entityTypes.indexOf(entityType), entityTypes.length);
    const data = await loadAllEntityOfType(entityType, projectPath);
    setEntities(entityType, data.entities, data.errors);
    const texts = await loadAllEntityTexts(entityType, projectPath, mainLanguage, data.entityList); // Should load the CSV files (texts) and build the initial entityLists
    texts.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: handle error
        console.error(result.reason);
        return;
      }
      result.value.handlers.forEach(([key, handler]) => setTexts(key, handler));
      setEntityList(result.value.entityListKey, result.value.entityList);
    });
  }
};

type LoadedTextResult = {
  handlers: (readonly [name: string, handler: CSVHandler])[];
  entityListKey: string;
  entityList: SelectOption<string>[];
};
const loadAllEntityTexts = async (
  entityType: string,
  projectPath: string,
  mainLanguage: string,
  entityList: (readonly [dbSymbol: string, data: Entity])[]
): Promise<PromiseSettledResult<LoadedTextResult>[]> => {
  const textDescriptions = entityTextRegistry[entityType];
  if (!textDescriptions || textDescriptions.length === 0) return [];

  const promises = textDescriptions.map(
    (description) =>
      new Promise<LoadedTextResult>((resolve, reject) => {
        try {
          const textFileId = description.textFileId;
          if (typeof textFileId === 'number') {
            resolve(loadWithFileId(entityType, projectPath, mainLanguage, textFileId, description, entityList));
          }

          resolve(loadWithoutFileId(entityType, projectPath, mainLanguage, description, entityList));
        } catch (e) {
          reject(e);
        }
      })
  );
  return Promise.allSettled(promises);
};

type CSVAccess = { csvFileId: number; csvTextIndex: number };
const loadWithoutFileId = (
  entityType: string,
  projectPath: string,
  mainLanguage: string,
  description: EntityTextDescription,
  entityList: (readonly [dbSymbol: string, data: Entity])[]
): LoadedTextResult => {
  const entityListKey = `${entityType}:${description.propertyInEntity}`;
  const discriminator = description.discriminator;
  if (typeof discriminator !== 'string') throw new Error('Invalid discriminator, cannot accept function when fileId is not known');

  const fileIds = new Set(
    entityList.map(([_, entity]) => {
      const csv = entity[discriminator] as CSVAccess;
      return csv.csvFileId;
    })
  );
  const fileHandlers = new Map([...fileIds].map((fileId) => [fileId, loadCSV(fileId, projectPath, false)] as const));

  return {
    handlers: [...fileHandlers.entries()].map(([fileId, handler]) => [`${fileId}`, handler] as const),
    entityListKey,
    entityList: entityList
      .map(([dbSymbol, entity]) => {
        const csv = entity[discriminator] as CSVAccess;
        const column = fileHandlers.get(csv.csvFileId)?.getColumn(mainLanguage) as string[]; // Always exist as how it was loaded
        return { value: dbSymbol, label: column[csv.csvTextIndex] ?? '---' };
      })
      .sort((a, b) => a.value.localeCompare(b.value)),
  };
};

const loadWithFileId = (
  entityType: string,
  projectPath: string,
  mainLanguage: string,
  textFileId: number,
  description: EntityTextDescription,
  entityList: (readonly [dbSymbol: string, data: Entity])[]
): LoadedTextResult => {
  const handler = loadCSV(textFileId, projectPath, description.textIsSystemFile ?? false);
  const entityListKey = `${entityType}:${description.propertyInEntity}`;
  const column = handler.getColumn(mainLanguage);
  const descriptionDiscriminator = description.discriminator;
  const discriminator =
    typeof descriptionDiscriminator === 'string' ? (entity: Entity) => entity[descriptionDiscriminator] as number : descriptionDiscriminator;
  return {
    handlers: [[entityListKey, handler]],
    entityListKey,
    entityList: entityList
      .map(([dbSymbol, entity]) => ({ value: dbSymbol, label: column[discriminator(entity)] ?? '---' }))
      .sort((a, b) => a.value.localeCompare(b.value)),
  };
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
