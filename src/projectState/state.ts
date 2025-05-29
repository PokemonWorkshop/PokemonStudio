/**
 * File holding the whole Project State
 */

import type { SelectOption } from '@ds/Select/types';
import type { InvalidJSONError } from '@utils/json/parse';
import type { ZodError } from 'zod';
import type { CSVHandler } from './text';
import type { LoadEntityTextError } from './loadTextOfEntities';
import { validateEntity } from './load';
import { clearHistory, hasEntityToSave, pushToHistory, redo, undo } from './history';

export type Entity = Record<string, unknown>;
export type EntityRecord = Record<string, Entity>;
export type EntityError = { dbSymbol: string; entityType: string; error: ZodError | InvalidJSONError };

let projectPath = '';
let mainLanguage = 'en';
let entities: Record<string, EntityRecord> = {};
let errors: EntityError[] = [];
let textErrors: LoadEntityTextError[] = [];
let entityLists: Record<string, SelectOption<string>[]> = {};
let texts: Record<string, CSVHandler> = {};

export const setProjectAndResetData = (newProjectPath: string, newMainLanguage: string) => {
  projectPath = newProjectPath;
  mainLanguage = newMainLanguage;
  entities = {};
  errors = [];
  textErrors = [];
  clearHistory();
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
  const current = entities[type][dbSymbol];
  if (current) pushToHistory(type, dbSymbol, current);
  entities[type][dbSymbol] = validateEntity(type, dbSymbol, entity);
};

export const getTextKeys = () => ({ handlers: Object.keys(texts), lists: Object.keys(entityLists) });

export const getEntityList = (key: string): SelectOption<string>[] | undefined => entityLists[key];
export const getTextHandler = (key: string): CSVHandler | undefined => texts[key];

export const anyDataToSave = () => hasEntityToSave() || Object.values(texts).some((v) => v.isTainted());

export const undoSetEntity = (type: string, dbSymbol: string) => {
  const current = entities[type][dbSymbol];
  if (!current) return;

  const previous = undo(type, dbSymbol, current);

  if (previous) entities[type][dbSymbol] = previous;
};

export const redoSetEntity = (type: string, dbSymbol: string) => {
  const current = entities[type][dbSymbol];
  if (!current) return;

  const next = redo(type, dbSymbol, current);

  if (next) entities[type][dbSymbol] = next;
};
