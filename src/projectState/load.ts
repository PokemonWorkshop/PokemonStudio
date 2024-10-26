import type { ZodObject, ZodRawShape } from 'zod';
import { pushTextError, setEntities, setEntityList, setTexts, type Entity, type EntityError, type EntityRecord } from './state';
import path from 'path';
import fs from 'fs/promises';
import { safeParseJSON } from '@utils/json/parse';
import { loadAllEntityTexts } from './loadTextOfEntities';

const entityRegistry: Record<string, { pathGlob: string; validator: ZodObject<ZodRawShape> }[]> = {};

export const registerEntity = <T extends ZodRawShape>(entityType: string, pathGlob: `${string}.json`, validator: ZodObject<T>) => {
  entityRegistry[entityType] ??= [];
  entityRegistry[entityType].push({ pathGlob, validator });
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
        pushTextError(result.reason);
        return;
      }
      result.value.handlers.forEach(([key, handler]) => setTexts(key, handler));
      setEntityList(result.value.entityListKey, result.value.entityList);
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
    return allFiles.filter((filename) => filename.endsWith(endFile));
  }

  return [path.join(projectPath, glob)];
};
