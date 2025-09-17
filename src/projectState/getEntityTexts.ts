import { getEntityTextDescription } from './loadTextOfEntities';
import { getEntityList, getEntityRecord, getProjectMainLanguage, getTextHandler } from './state';

// TODO: fix this function: it cannot work by using the entityList as all the other texts are not part of lists!
export const getEntityTexts = (entityType: string, dbSymbol: string): Record<string, string | undefined> => {
  const descriptors = getEntityTextDescription(entityType);
  if (!descriptors) return {};

  const mainLanguage = getProjectMainLanguage();

  return Object.fromEntries(
    descriptors.map((d) => {
      const entityListKey = `${entityType}:${d.propertyInEntity}`;
      const list = getEntityList(entityListKey);
      if (list) return [d.propertyInEntity, list.find(({ value }) => value === dbSymbol)?.label];

      const entity = getEntityRecord(entityType)?.[dbSymbol];
      const index = entity?.[d.discriminator];
      if (Number.isInteger(index) && typeof index === 'number') {
        return [d.propertyInEntity, getTextHandler(entityListKey)?.getColumn(mainLanguage)?.at(index)];
      }

      // TODO: Handle form[x].property
      return [d.propertyInEntity, ''];
    })
  );
};

// Test: window.stateApi.getEntityText({ type: 'creature', dbSymbol: 'pikachu'}, console.info, console.error)
