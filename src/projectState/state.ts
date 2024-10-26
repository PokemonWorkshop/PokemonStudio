/**
 * File holding the whole Project State
 */

import type { SelectOption } from '@ds/Select/types';
import type { InvalidJSONError } from '@utils/json/parse';
import type { ZodError } from 'zod';
import type { CSVHandler } from './text';

export type Entity = Record<string, unknown>;
export type EntityRecord = Record<string, Entity>;
export type EntityError = { dbSymbol: string; entityType: string; error: ZodError | InvalidJSONError };
export type TextError = { fileId: number; isSystemFile: boolean; error: Error };
type History = { previous: Entity[]; next: Entity[] };

let projectPath = '';
let mainLanguage = 'en';
let entities: Record<string, EntityRecord> = {};
let errors: EntityError[] = [];
let textErrors: TextError[] = [];
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

export const pushTextErrors = (errors: TextError[]) => {
  textErrors.push(...errors);
};

export const setEntityList = (key: string, list: SelectOption<string>[]) => {
  entityLists[key] = list;
};
