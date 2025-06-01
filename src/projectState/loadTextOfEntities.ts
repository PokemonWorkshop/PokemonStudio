import type { SelectOption } from '@ds/Select/types';
import type { Entity } from './state';
import { type CSVHandler, loadCSV } from './text';

const entityTextRegistry: Record<string, EntityTextDescription[]> = {};

export const registerEntityText = (entityType: string, description: EntityTextDescription) => {
  entityTextRegistry[entityType] ??= [];
  entityTextRegistry[entityType].push(description);
};

export type GetEntityListFunction = (
  entityType: string,
  entityListEntries: EntityListEntry[],
  description: EntityTextDescription,
  getHandler: (id: string) => CSVHandler | undefined,
  mainLanguage: string
) => SelectOption<string>[];

export type LoadTextFunction = (
  entityType: string,
  projectPath: string,
  mainLanguage: string,
  description: EntityTextDescription,
  entityList: EntityListEntry[]
) => LoadedTextResult;
export type EntityListRefinementFunction = (entityList: EntityListEntry[]) => EntityListEntry[];

export type EntityTextDescription = {
  propertyInEntity: string;
  textFileId?: number;
  textIsSystemFile?: boolean;
  discriminator: string; //| ((entity: Entity) => number);
  getEntityList?: GetEntityListFunction;
  loadTexts: LoadTextFunction;
};
type EntityListEntry = readonly [dbSymbol: string, data: Entity];
type LoadedTextResult = {
  handlers: (readonly [name: string, handler: CSVHandler])[];
  entityListKey: string;
  entityList?: SelectOption<string>[];
};
export type LoadEntityTextError = { description: EntityTextDescription; error: unknown };

export const loadAllEntityTexts = async (
  entityType: string,
  projectPath: string,
  mainLanguage: string,
  entityList: EntityListEntry[]
): Promise<PromiseSettledResult<LoadedTextResult>[]> => {
  const textDescriptions = entityTextRegistry[entityType];
  if (!textDescriptions || textDescriptions.length === 0) return [];

  const promises = textDescriptions.map(
    (description) =>
      new Promise<LoadedTextResult>((resolve, reject) => {
        try {
          resolve(description.loadTexts(entityType, projectPath, mainLanguage, description, entityList));
        } catch (e) {
          const error: LoadEntityTextError = { description, error: e };
          reject(error);
        }
      })
  );
  return Promise.allSettled(promises);
};

type CSVAccess = { csvFileId: number; csvTextIndex: number };

export const loadTextByCSVAccess =
  (refinement?: EntityListRefinementFunction): LoadTextFunction =>
  (entityType, projectPath, mainLanguage, description, entityList) => {
    const entityListKey = `${entityType}:${description.propertyInEntity}`;
    const discriminator = description.discriminator;
    if (typeof discriminator !== 'string') throw new Error('Invalid discriminator, cannot accept function when fileId is not known');

    const refinedEntityList = refinement ? refinement(entityList) : entityList;
    const fileIds = new Set(refinedEntityList.map(([_, entity]) => (entity[discriminator] as CSVAccess).csvFileId));
    const fileHandlers = new Map([...fileIds].map((fileId) => [fileId, loadCSV(fileId, projectPath, Math.floor(fileId / 100000) === 2)] as const));
    // Note: Extracting a method from an OOP object unbind the said method (and this is stupid)
    const getHandler = (id: string) => fileHandlers.get(+id);

    return {
      handlers: [...fileHandlers.entries()].map(([fileId, handler]) => [`${fileId}`, handler] as const),
      entityListKey,
      entityList: description.getEntityList?.(entityType, entityList, description, getHandler, mainLanguage),
    };
  };

export const mapEntityListByCSVAccess =
  (refinement?: EntityListRefinementFunction): GetEntityListFunction =>
  (_, entityListEntries, description, getHandler, mainLanguage) => {
    const entityList = refinement ? refinement(entityListEntries) : entityListEntries;
    const discriminator = description.discriminator;

    return entityList
      .map(([dbSymbol, entity]) => {
        const csv = entity[discriminator] as CSVAccess;
        const column = getHandler(`${csv.csvFileId}`)?.getColumn(mainLanguage) ?? [];
        return { value: dbSymbol, label: column[csv.csvTextIndex] ?? '---' };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  };

export const loadTextByFileId =
  (fileId: number, isSystemText: boolean): LoadTextFunction =>
  (
    entityType: string,
    projectPath: string,
    mainLanguage: string,
    description: EntityTextDescription,
    entityList: EntityListEntry[]
  ): LoadedTextResult => {
    const handler = loadCSV(fileId, projectPath, isSystemText);
    const entityListKey = `${entityType}:${description.propertyInEntity}`;

    return {
      handlers: [[entityListKey, handler]],
      entityListKey,
      entityList: description.getEntityList?.(entityType, entityList, description, () => handler, mainLanguage),
    };
  };

export const mapEntityListByFileId =
  (refinement?: EntityListRefinementFunction): GetEntityListFunction =>
  (entityType, entityListEntries, description, getHandler, mainLanguage) => {
    const discriminator = description.discriminator;
    const index = (entity: Entity) => entity[discriminator] as number;
    const entityListKey = `${entityType}:${description.propertyInEntity}`;
    const column = getHandler(entityListKey)?.getColumn(mainLanguage) ?? [];
    const entityList = refinement ? refinement(entityListEntries) : entityListEntries;

    return entityList
      .map(([dbSymbol, entity]) => ({ value: dbSymbol, label: column[index(entity)] ?? '---' }))
      .sort((a, b) => a.value.localeCompare(b.value));
  };

export const getEntityTextDescription = (entityType: string) => entityTextRegistry[entityType];
