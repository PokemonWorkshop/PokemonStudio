import { getEntityTextDescription } from './loadTextOfEntities';
import { getEntityRecord, getProjectMainLanguage, getTextHandler, setEntityList } from './state';

export type EntityHint = { entityType: string; propertyInEntity: string };

export const updateEntityList = ({ entityType, propertyInEntity }: EntityHint) => {
  const descriptors = getEntityTextDescription(entityType);
  if (!descriptors) return;

  const descriptor = descriptors.find((k) => k.propertyInEntity === propertyInEntity);
  if (!descriptor || !descriptor.getEntityList) return;

  const entityListKey = `${entityType}:${descriptor.propertyInEntity}`;
  const entityRecord = getEntityRecord(entityType);
  if (!entityRecord) return;

  const list = descriptor.getEntityList(entityType, Object.entries(entityRecord), descriptor, getTextHandler, getProjectMainLanguage());
  setEntityList(entityListKey, list);
};

/*
Test:

window.stateApi.load({ projectPath: '/Volumes/ssd/projects/PSDK', mainLanguage: 'en' }, console.info, console.error, console.log);
window.stateApi.getEntityList({ key: 'ability:name' }, console.info, console.error)
window.stateApi.getTextColumn({ key: 'ability:name', language: 'en' }, console.info, console.error); // => 91
window.stateApi.setText({ key: 'ability:name', index: 91, text: 'AAAA', entityHint: { entityType: 'ability', propertyInEntity: 'name' }}, console.info, console.error)
window.stateApi.getEntityList({ key: 'ability:name' }, console.info, console.error)
window.stateApi.getTextColumn({ key: 'ability:name', language: 'en' }, console.info, console.error);

window.stateApi.getEntityList({ key: 'dex:name' }, console.info, console.error);
window.stateApi.getTextColumn({ key: '100063', language: 'en' }, console.info, console.error); // => 0
window.stateApi.setText({ key: '100063', index: 0, text: 'DDDD', entityHint: { entityType: 'dex', propertyInEntity: 'name' }}, console.info, console.error)
window.stateApi.getEntityList({ key: 'dex:name' }, console.info, console.error);
window.stateApi.getTextColumn({ key: '100063', language: 'en' }, console.info, console.error);
*/
