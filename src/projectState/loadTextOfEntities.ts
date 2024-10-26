import type { SelectOption } from '@ds/Select/types';
import type { Entity } from './state';
import { type CSVHandler, loadCSV } from './text';

const entityTextRegistry: Record<string, EntityTextDescription[]> = {};

export const registerEntityText = (entityType: string, description: EntityTextDescription) => {
  entityTextRegistry[entityType] ??= [];
  entityTextRegistry[entityType].push(description);
};

type EntityTextDescription = {
  propertyInEntity: string;
  textFileId?: number;
  textIsSystemFile?: boolean;
  discriminator: string; //| ((entity: Entity) => number);
  // dbSymbol?: string; // Removed to simplify the problem
  // pathToProperties?: (string | NumberConstructor)[]; // Removed to simplify the problem
};
type EntityListEntry = readonly [dbSymbol: string, data: Entity];
type LoadedTextResult = {
  handlers: (readonly [name: string, handler: CSVHandler])[];
  entityListKey: string;
  entityList: SelectOption<string>[];
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
          const textFileId = description.textFileId;
          if (typeof textFileId === 'number') {
            resolve(loadWithFileId(entityType, projectPath, mainLanguage, textFileId, description, entityList));
          }

          resolve(loadWithoutFileId(entityType, projectPath, mainLanguage, description, entityList));
        } catch (e) {
          const error: LoadEntityTextError = { description, error: e };
          reject(error);
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
