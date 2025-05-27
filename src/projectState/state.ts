/**
 * File holding the whole Project State
 */

import type { SelectOption } from '@ds/Select/types';
import type { InvalidJSONError } from '@utils/json/parse';
import type { ZodError } from 'zod';
import type { CSVHandler } from './text';
import type { LoadEntityTextError } from './loadTextOfEntities';
import { validateEntity } from './load';

export type Entity = Record<string, unknown>;
export type EntityRecord = Record<string, Entity>;
export type EntityError = { dbSymbol: string; entityType: string; error: ZodError | InvalidJSONError };
type History = { previous: Entity[]; next: Entity[] };

let projectPath = '';
let mainLanguage = 'en';
let entities: Record<string, EntityRecord> = {};
let errors: EntityError[] = [];
let textErrors: LoadEntityTextError[] = [];
let history: Record<string, Record<string, History>> = {};
let entityLists: Record<string, SelectOption<string>[]> = {};
let texts: Record<string, CSVHandler> = {};

export const setProjectAndResetData = (newProjectPath: string, newMainLanguage: string) => {
  projectPath = newProjectPath;
  mainLanguage = newMainLanguage;
  entities = {};
  errors = [];
  textErrors = [];
  history = {};
  entityLists = {};
  texts = {};
};

export const getProjectPath = () => projectPath;
export const getProjectMainLanguage = () => mainLanguage;

export const setEntities = (entityType: string, entitiesToSet: EntityRecord, errorsToSet: EntityError[]) => {
  entities[entityType] = entitiesToSet;
  errors.push(...errorsToSet);
};

export const setTexts = (key: string, handler: CSVHandler) => {
  texts[key] = handler;
};

export const pushTextError = (error: LoadEntityTextError) => {
  textErrors.push(error);
};

export const setEntityList = (key: string, list: SelectOption<string>[]) => {
  entityLists[key] = list;
};

export const getErrorCounts = () => ({ entityErrorCount: errors.length, textErrorCount: textErrors.length });

export const getEntityRecord = (type: string): EntityRecord | undefined => entities[type];

export const setEntity = (type: string, dbSymbol: string, entity: unknown) => {
  // TODO: move history management out
  const current = entities[type][dbSymbol];
  if (current) {
    history[type] ||= {};
    history[type][dbSymbol] ||= { previous: [], next: [] };
    history[type][dbSymbol].previous.push(current);
  }
  entities[type][dbSymbol] = validateEntity(type, dbSymbol, entity);
};

export const getTextKeys = () => ({ handlers: Object.keys(texts), lists: Object.keys(entityLists) });

export const getEntityList = (key: string): SelectOption<string>[] | undefined => entityLists[key];
export const getTextHandler = (key: string): CSVHandler | undefined => texts[key];

export const anyDataToSave = () => Object.keys(history).length !== 0 || Object.values(texts).some((v) => v.isTainted());
