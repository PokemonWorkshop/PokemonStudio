import { StudioEvent } from '../../models/entities/event/event';
import { DEFAULT_EVENT_TREE, StudioEventTree, StudioEventTreeFolder, StudioEventTreeValue } from '../../models/entities/event/event-tree';
import { DbSymbol } from '../../models/entities/dbSymbol';
import { ItemId, TreeData, TreeItem } from '../../views/components/tree';
import { cloneEntity } from '../cloneEntity';

export const convertEventTreeToTree = (eventTree: StudioEventTree): TreeData => {
  const items: Record<ItemId, TreeItem> = {};

  Object.entries(eventTree).forEach(([key, treeValue]) => {
    items[key === '0' ? 0 : key] = {
      id: key === '0' ? 0 : key,
      children: treeValue.children as string[],
      hasChildren: (treeValue.children?.length ?? 0) > 0,
      isExpanded: treeValue.isExpanded ?? true,
      data: treeValue.data,
    };
  });

  return { rootId: 0, items };
};

export const convertTreeToEventTree = (treeData: Record<string | number, TreeItem>): StudioEventTree => {
  const result: StudioEventTree = {};

  const traverse = (itemId: string | number) => {
    const item = treeData[itemId];
    if (!item) return;

    const key = String(itemId);
    result[key] = {
      id: item.id as number | string,
      children: item.children as string[],
      hasChildren: (item.children?.length ?? 0) > 0,
      isExpanded: item.isExpanded ?? false,
      data: item.data,
    } as StudioEventTreeValue;

    item.children.forEach((childId) => traverse(childId));
  };

  traverse(0);
  return result;
};

export const addNewEventToEventTree = (
  eventTree: StudioEventTree,
  dbSymbol: DbSymbol,
  eventId: number,
  parentDbSymbol?: DbSymbol,
): StudioEventTree => {
  const cloned = cloneEntity(eventTree);
  const parentKey = parentDbSymbol ?? '0';
  const parent = cloned[parentKey];
  if (!parent) return cloned;
  (parent.children as string[]).push(dbSymbol);
  parent.hasChildren = true;
  if (parentDbSymbol) parent.isExpanded = true;
  return {
    ...cloned,
    [parentKey]: parent,
    [dbSymbol]: {
      id: dbSymbol,
      children: [],
      hasChildren: false,
      isExpanded: false,
      data: { klass: 'Event', dbSymbol, id: eventId },
    },
  };
};

export const addNewEventTreeFolder = (eventTree: StudioEventTree, newFolder: StudioEventTreeFolder): StudioEventTree => {
  const cloned = cloneEntity(eventTree);
  const root = cloned['0'];
  root.children.push(newFolder.data.dbSymbol);
  root.hasChildren = true;
  return {
    ...cloned,
    ['0']: root,
    [newFolder.data.dbSymbol]: newFolder,
  };
};

const removeEventTreeItemFromParent = (eventTree: StudioEventTree, dbSymbol: string) => {
  const parent = Object.values(eventTree).find((item) => (item.children as string[]).includes(dbSymbol));
  if (!parent) return;
  parent.children = (parent.children as string[]).filter((id) => id !== dbSymbol) as typeof parent.children;
  parent.hasChildren = parent.children.length > 0;
};

export const getEventTreeChildrenDbSymbols = (eventTree: StudioEventTree, item: StudioEventTreeValue): string[] => {
  if (item.children.length === 0) return [];
  const children = [...(item.children as string[])];
  (item.children as string[]).forEach((childDbSymbol) => {
    const child = eventTree[childDbSymbol];
    if (child) children.push(...getEventTreeChildrenDbSymbols(eventTree, child));
  });
  return children;
};

export const removeEventTreeItem = (eventTree: StudioEventTree, dbSymbol: string): StudioEventTree => {
  const item = eventTree[dbSymbol];
  if (!item) return eventTree;
  const keysToRemove = [dbSymbol, ...getEventTreeChildrenDbSymbols(eventTree, item)];
  const cloned = cloneEntity(eventTree);
  keysToRemove.forEach((key) => delete cloned[key]);
  removeEventTreeItemFromParent(cloned, dbSymbol);
  return cloned;
};

export const convertEventToTree = (events: Record<string, StudioEvent>, eventTree: StudioEventTree | undefined): TreeData => {
  // If we got an event Tree, use it
  if (eventTree && Object.keys(eventTree).length > 1) {
    return convertEventTreeToTree(eventTree);
  }
  //  If not, build a new one
  return { rootId: 0, items: DEFAULT_EVENT_TREE };
};

export const findEventHasFolder = (eventTree: StudioEventTree, eventDbSymbol: DbSymbol): StudioEventTreeFolder | undefined => {
  const values = Object.values(eventTree) as StudioEventTreeValue[];
  const eventEntry = values.find((entry) => entry.data.klass === 'Event' && entry.data.dbSymbol === eventDbSymbol);
  if (!eventEntry) return undefined;

  return values.find(
    (entry): entry is StudioEventTreeFolder => entry.data.klass === 'EventFolder' && entry.children.includes(eventEntry.id as DbSymbol),
  );
};

/* The tree does not change the structure of the TreeItem, whose data is provided by the eventTree.
 * This means that the data present in the input also exists in the output.
 * The ItemId can be an Integer or a String, but this has no effect on the eventTree.
 * So "conversions" are safe.
 */

export const eventTreeConvertItemToEventTreeValue = (item: TreeItem) => {
  return item as unknown as StudioEventTreeValue;
};
