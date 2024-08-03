/**
 * File holding the whole Project State
 */

import type { SelectOption } from '@ds/Select/types';
import type { InvalidJSONError } from '@utils/json/parse';
import type { ZodError } from 'zod';

export type Entity = Record<string, unknown>;
export type EntityRecord = Record<string, Entity>;
export type EntityError = { dbSymbol: string; entityType: string; error: ZodError | InvalidJSONError };
type History = { previous: Entity[]; next: Entity[] };

let projectPath = '';
let mainLanguage = 'en';
let entities: Record<string, EntityRecord> = {};
let errors: EntityError[] = [];
let history: Record<string, Record<string, History>> = {};
let entityLists: Record<string, SelectOption<string>[]> = {};
let texts: Record<string, Record<string, string[]>> = {};

export const setProjectAndResetData = (newProjectPath: string, newMainLanguage: string) => {
  projectPath = newProjectPath;
  mainLanguage = newMainLanguage;
  entities = {};
  errors = [];
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
