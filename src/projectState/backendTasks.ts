import { type AnyObject, defineBackendServiceFunction } from '@src/backendTasks/defineBackendServiceFunction';
import {
  anyDataToSave,
  getEntityList,
  getEntityRecord,
  getErrorCounts,
  getProjectMainLanguage,
  getProjectPath,
  getTextHandler,
  getTextKeys,
  redoSetEntity,
  setEntity,
  setProjectAndResetData,
  undoSetEntity,
} from './state';
import { loadAllEntities } from './load';
import { sendProgress } from '@utils/BackendTask';
import './loadDefinitions';
import { EntityHint, updateEntityList } from './updateEntityList';
import { getEntityTexts } from './getEntityTexts';
import { saveAllEntities } from './save';

// window.stateApi.load({ projectPath: '/Volumes/ssd/projects/PSDK', mainLanguage: 'en' }, console.info, console.error, console.log);
export type LoadProjectTaskPayload = { projectPath: string; mainLanguage: string };

export const registerLoadProjectStateTask = defineBackendServiceFunction<LoadProjectTaskPayload, AnyObject>(
  'load-project-state-task',
  async ({ projectPath, mainLanguage }, event, channels) => {
    // TODO: load project.studio
    setProjectAndResetData(projectPath, mainLanguage);
    await loadAllEntities(projectPath, mainLanguage, (stepText, step, total) => sendProgress(event, channels, { stepText, step, total }));
    return getErrorCounts();
  }
);

export const registerSaveProjectStateTask = defineBackendServiceFunction<AnyObject, AnyObject>(
  'save-project-state-task',
  async (_, event, channels) => {
    await saveAllEntities(getProjectPath(), (stepText, step, total) => sendProgress(event, channels, { stepText, step, total }));
    return {};
  }
);

export type GetEntityTaskPayload = { type: string; dbSymbol: string };

export const registerGetEntityInProjectStateTask = defineBackendServiceFunction<GetEntityTaskPayload, AnyObject>(
  'get-entity-in-project-state',
  async ({ type, dbSymbol }) => {
    const record = getEntityRecord(type);
    if (!record) throw new Error(`No entity of type ${type}`);

    const entity = record[dbSymbol];
    if (!entity) throw new Error(`No entity for ${dbSymbol} in ${type}`);

    return entity;
  }
);

export type GetEntityTextTaskOutput = Record<string, string | undefined>;
export const registerGetEntityTextInProjectStateTask = defineBackendServiceFunction<GetEntityTaskPayload, GetEntityTextTaskOutput>(
  'get-entity-text-in-project-state',
  async ({ type, dbSymbol }) => {
    const record = getEntityRecord(type);
    if (!record) throw new Error(`No entity of type ${type}`);

    const entity = record[dbSymbol];
    if (!entity) throw new Error(`No entity for ${dbSymbol} in ${type}`);

    return getEntityTexts(type, dbSymbol);
  }
);

export type SetEntityTaskPayload = { type: string; dbSymbol: string; entity: unknown };

export const registerUndoEntityInProjectStateTask = defineBackendServiceFunction<GetEntityTaskPayload, AnyObject>(
  'undo-entity-in-project-state',
  async ({ type, dbSymbol }) => {
    undoSetEntity(type, dbSymbol);
    return {};
  }
);

export const registerRedoEntityInProjectStateTask = defineBackendServiceFunction<GetEntityTaskPayload, AnyObject>(
  'redo-entity-in-project-state',
  async ({ type, dbSymbol }) => {
    redoSetEntity(type, dbSymbol);
    return {};
  }
);

export const registerSetEntityInProjectStateTask = defineBackendServiceFunction<SetEntityTaskPayload, AnyObject>(
  'set-entity-in-project-state',
  async ({ type, dbSymbol, entity }) => {
    setEntity(type, dbSymbol, entity);
    return {};
  }
);

export type GetTextKeysInProjectOutput = ReturnType<typeof getTextKeys>;

export const registerGetTextKeysInProjectStateTask = defineBackendServiceFunction<AnyObject, GetTextKeysInProjectOutput>(
  'get-text-keys-in-project-state',
  async () => getTextKeys()
);

export type GetEntityListInProjectInput = { key: string };
export type GetEntityListInProjectOutput = { list: ReturnType<typeof getEntityList> };
export const registerGetEntityListInProjectStateTask = defineBackendServiceFunction<GetEntityListInProjectInput, GetEntityListInProjectOutput>(
  'get-entity-list-in-project-state',
  async ({ key }) => ({ list: getEntityList(key) })
);

export type GetTextInProjectStateInput = { key: string; index: number; language?: string };
export type GetTextInProjectStateOutput = { text: string | undefined };
export const registerGetTextInProjectState = defineBackendServiceFunction<GetTextInProjectStateInput, GetTextInProjectStateOutput>(
  'get-text-in-project-state',
  async ({ key, index, language }) => ({ text: getTextHandler(key)?.getColumn(language ?? getProjectMainLanguage())?.[index] })
);

export type GetTextColumnInProjectStateInput = { key: string; language: string };
export type GetTextColumnInProjectStateOutput = { texts: readonly string[] | undefined };
export const registerGetTextColumnInProjectState = defineBackendServiceFunction<GetTextColumnInProjectStateInput, GetTextColumnInProjectStateOutput>(
  'get-text-column-in-project-state',
  async ({ key, language }) => ({ texts: getTextHandler(key)?.getColumn(language) })
);

export type SetTextInProjectStateInput = { key: string; index: number; language?: string; text: string; entityHint?: EntityHint };
export const registerSetTextInProjectState = defineBackendServiceFunction<SetTextInProjectStateInput, AnyObject>(
  'set-text-in-project-state',
  async ({ key, index, language, text, entityHint }) => {
    const handler = getTextHandler(key);
    if (!handler) return {};

    handler.setValue(language ?? getProjectMainLanguage(), text, index);

    if (entityHint) updateEntityList(entityHint);

    return {};
  }
);

export type GetDataToSaveStateInProjectStateOutput = { hasDataToSave: boolean };
export const registerGetDataToSaveStateInProjectState = defineBackendServiceFunction<AnyObject, GetDataToSaveStateInProjectStateOutput>(
  'get-data-to-save-state-in-project-state',
  async () => ({ hasDataToSave: anyDataToSave() })
);
