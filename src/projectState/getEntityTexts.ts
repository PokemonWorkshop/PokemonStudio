import { getEntityTextDescription } from './loadTextOfEntities';
import { getEntityList } from './state';

// TODO: fix this function: it cannot work by using the entityList as all the other texts are not part of lists!
export const getEntityTexts = (entityType: string, dbSymbol: string): Record<string, string | undefined> => {
  const descriptors = getEntityTextDescription(entityType);
  if (!descriptors) return {};

  return Object.fromEntries(
    descriptors.map((d) => {
      const entityListKey = `${entityType}:${d.propertyInEntity}`;
      const list = getEntityList(entityListKey);
      return [d.propertyInEntity, list?.find(({ value }) => value === dbSymbol)?.label];
    })
  );
};

// Test: window.stateApi.getEntityText({ type: 'creature', dbSymbol: 'pikachu'}, console.info, console.error)
