import { markAllAsSaved, needsToBeSaved } from './history';
import { EntityRegistryEntry, getAllEntityTypes, getEntityRegistry } from './load';
import { getEntityRecord, getTextHandler, getTextKeys } from './state';
import fs from 'fs';
import path from 'path';

export const saveAllEntities = async (projectPath: string, progress: (entityType: string, step: number, total: number) => void) => {
  const entityTypes = getAllEntityTypes();
  const textKeys = getTextKeys().handlers;
  const totalStep = entityTypes.length + textKeys.length;
  for (const entityType of entityTypes) {
    progress(entityType, entityTypes.indexOf(entityType) + 1, totalStep);
    await saveEntities(projectPath, entityType);
  }

  markAllAsSaved();

  for (const textHandlerId of textKeys) {
    progress(textHandlerId, textKeys.indexOf(textHandlerId) + entityTypes.length, totalStep);
    getTextHandler(textHandlerId)?.save();
    // Give the IPC a bit of breathing space
    await new Promise((r) => setTimeout(r, 0));
  }
};

const saveEntities = async (projectPath: string, entityType: string) => {
  const record = getEntityRecord(entityType);
  const registry = getEntityRegistry(entityType);
  if (!record || !registry) return;

  const keys = Object.keys(record).filter((dbSymbol) => needsToBeSaved(entityType, dbSymbol));
  for (const dbSymbol of keys) {
    const filename = path.join(projectPath, getEntityFilename(registry, dbSymbol));
    const filePath = path.dirname(filename);
    if (!fs.existsSync(filePath)) await fs.promises.mkdir(filePath);

    await fs.promises.writeFile(filename, JSON.stringify(record[dbSymbol], null, 2));
  }
};

const getEntityFilename = (registry: EntityRegistryEntry[], dbSymbol: string): string => {
  const filename = `/${dbSymbol}.json`;
  const matchingRegistry = registry.find((v) => v.pathGlob.endsWith(filename));
  if (matchingRegistry) return matchingRegistry.pathGlob;

  return (registry.find((f) => f.pathGlob.includes('*.json'))?.pathGlob ?? 'Data/Studio/Lost/*.json').replace('/*.json', filename);
};

/*
Test:

window.stateApi.load({ projectPath: '/Volumes/ssd/projects/PSDK', mainLanguage: 'en' }, console.info, console.error, console.log);
window.stateApi.setText({ key: 'creature:name', index: 25, text: 'Pokachu', entityHint: {entityType: 'creature', propertyInEntity: 'name' }}, console.info, console.error);
window.stateApi.getEntity({type: 'creature', dbSymbol: 'pikachu' }, (e) => {
  window.stateApi.setEntity({ type: 'creature', dbSymbol: 'pikachu', entity: e }, console.log, console.error)
}, console.error);
window.stateApi.save({}, console.info, console.error, console.log);

*/
