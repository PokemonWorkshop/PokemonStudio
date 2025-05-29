import { Entity } from './state';

type History = { previous: Entity[]; next: Entity[]; saved: boolean };
let history: Record<string, Record<string, History>> = {};

export const clearHistory = () => {
  history = {};
};

const presetHistory = (entityType: string, dbSymbol: string) => {
  history[entityType] ||= {};
  history[entityType][dbSymbol] ||= { previous: [], next: [], saved: true };
};

export const pushToHistory = (entityType: string, dbSymbol: string, entity: Entity) => {
  presetHistory(entityType, dbSymbol);
  const entry = history[entityType][dbSymbol];
  entry.previous.push(entity);
  entry.next.splice(0, entry.next.length);
  entry.saved = false;
};

export const hasPrevious = (entityType: string, dbSymbol: string): boolean => {
  const entry = history[entityType]?.[dbSymbol];
  if (!entry) return false;

  return entry.previous.length > 0;
};

export const hasNext = (entityType: string, dbSymbol: string): boolean => {
  const entry = history[entityType]?.[dbSymbol];
  if (!entry) return false;

  return entry.next.length > 0;
};

export const redo = (entityType: string, dbSymbol: string, current: Entity): Entity | undefined => {
  if (!hasNext(entityType, dbSymbol)) return undefined;

  const entry = history[entityType][dbSymbol];
  entry.previous.push(current);
  entry.saved = false;
  return entry.next.pop();
};

export const undo = (entityType: string, dbSymbol: string, current: Entity): Entity | undefined => {
  if (!hasPrevious(entityType, dbSymbol)) return undefined;

  const entry = history[entityType][dbSymbol];
  entry.next.push(current);
  entry.saved = false;
  return entry.previous.pop();
};

export const hasEntityToSave = (): boolean => Object.values(history).some((h) => Object.values(h).some((e) => !e.saved));
export const markAllAsSaved = () =>
  Object.values(history).forEach((h) =>
    Object.values(h).forEach((e) => {
      e.saved = true;
    })
  );
export const needsToBeSaved = (entityType: string, dbSymbol: string): boolean => history[entityType]?.[dbSymbol]?.saved === false;
