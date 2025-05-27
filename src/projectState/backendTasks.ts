import { type AnyObject, defineBackendServiceFunction } from '@src/backendTasks/defineBackendServiceFunction';
import {
  getEntityList,
  getEntityRecord,
  getErrorCounts,
  getProjectMainLanguage,
  getTextHandler,
  getTextKeys,
  setEntity,
  setProjectAndResetData,
} from './state';
import { loadAllEntities } from './load';
import { sendProgress } from '@utils/BackendTask';
import './loadDefinitions';
import { EntityHint, updateEntityList } from './updateEntityList';

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

export type SetEntityTaskPayload = { type: string; dbSymbol: string; entity: unknown };

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
