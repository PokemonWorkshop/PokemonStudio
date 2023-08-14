import { arrayMove } from '@dnd-kit/sortable';

import type { FlattenedItem, ProjectionItem, TreeItem, TreeItems } from './TreeTypes';
import { UniqueIdentifier } from '@dnd-kit/core';

const getDragDepth = (offset: number, indentationWidth: number) => {
  return Math.round(offset / indentationWidth);
};

const findParentWithDepth = <T>(depth: number, previousItem: FlattenedItem<T>) => {
  if (!previousItem) return null;
  while (depth < previousItem.depth) {
    if (previousItem.parent === null) return null;
    previousItem = previousItem.parent;
  }
  return previousItem;
};

const findParentWhichCanHaveChildren = <T>(
  parent: FlattenedItem<T> | null,
  activeItem: FlattenedItem<T>,
  dragItem: FlattenedItem<T>
): FlattenedItem<T> | null => {
  if (!parent) return parent;
  const canHaveChildren = typeof parent.canHaveChildren === 'function' ? parent.canHaveChildren(dragItem) : parent.canHaveChildren;
  if (canHaveChildren === false) return findParentWhichCanHaveChildren(parent.parent, activeItem, dragItem);
  return parent;
};

const getParentId = <T>(depth: number, previousItem: FlattenedItem<T>, newItems: FlattenedItem<T>[], overItemIndex: number) => {
  if (depth === 0 || !previousItem) {
    return null;
  }

  if (depth === previousItem.depth) {
    return previousItem.parentId;
  }

  if (depth > previousItem.depth) {
    return previousItem.id;
  }

  const newParent = newItems
    .slice(0, overItemIndex)
    .reverse()
    .find((item) => item.depth === depth)?.parentId;

  return newParent ?? null;
};

let _revertLastChanges = () => {
  return;
};
export const getProjection = <T>(
  items: FlattenedItem<T>[],
  activeId: UniqueIdentifier | null,
  overId: UniqueIdentifier | null,
  dragOffset: number,
  indentationWidth: number
): ProjectionItem<T> => {
  _revertLastChanges();
  _revertLastChanges = () => {
    return;
  };
  if (!activeId || !overId) return null;

  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  let depth = projectedDepth;
  let parent = findParentWithDepth(depth - 1, previousItem);
  parent = findParentWhichCanHaveChildren(parent, activeItem, activeItem);
  const maxDepth = (parent?.depth ?? -1) + 1;
  const minDepth = nextItem?.depth ?? 0;

  if (depth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }
  const isLast = (nextItem?.depth ?? -1) < depth;

  if (parent && parent.isLast) {
    _revertLastChanges = () => {
      if (parent !== null) parent.isLast = true;
    };
    parent.isLast = false;
  }
  return {
    depth,
    parentId: getParentId(depth, previousItem, newItems, overItemIndex),
    parent,
    isLast,
    current: activeItem,
  };
};

const flatten = <T extends Record<string, unknown>>(
  items: TreeItems<T>,
  parentId: UniqueIdentifier | null = null,
  depth = 0,
  parent: FlattenedItem<T> | null = null
): FlattenedItem<T>[] => {
  return items.reduce<FlattenedItem<T>[]>((acc, item, index) => {
    const flattenedItem: FlattenedItem<T> = {
      ...item,
      parentId,
      depth,
      index,
      isLast: items.length === index + 1,
      parent: parent,
    };
    return [...acc, flattenedItem, ...flatten(item.children ?? [], item.id, depth + 1, flattenedItem)];
  }, []);
};

export const flattenTree = <T extends Record<string, unknown>>(items: TreeItems<T>): FlattenedItem<T>[] => {
  return flatten(items);
};

export const buildTree = <T extends Record<string, unknown>>(flattenedItems: FlattenedItem<T>[]): TreeItems<T> => {
  const root: TreeItem<T> = { id: 'root', children: [] } as unknown as TreeItem<T>;
  const nodes: Record<string, TreeItem<T>> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  items.forEach((item) => {
    const { id } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    item.parent = null;
    nodes[id] = item;
    parent?.children?.push(item);
  });

  return root.children ?? [];
};

export const findItem = <T>(items: TreeItem<T>[], itemId: UniqueIdentifier) => {
  return items.find(({ id }) => id === itemId);
};

export const findItemDeep = <T extends Record<string, unknown>>(items: TreeItems<T>, itemId: UniqueIdentifier): TreeItem<T> | undefined => {
  const foundItem = items.find((item) => item.id === itemId);
  if (foundItem) {
    return foundItem;
  }

  return items
    .flatMap((item) => item.children ?? [])
    .map((child) => findItemDeep([child], itemId))
    .find((child) => child !== undefined);
};

export const removeItem = <T extends Record<string, unknown>>(items: TreeItems<T>, id: string) => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children?.length) {
        item.children = removeItem(item.children, id);
      }
      return item;
    });
};

export const setProperty = <TData extends Record<string, unknown>, T extends keyof TreeItem<TData>>(
  items: TreeItems<TData>,
  id: string,
  property: T,
  setter: (value: TreeItem<TData>[T]) => TreeItem<TData>[T]
) => {
  items.forEach((item) => {
    if (item.id === id) {
      item[property] = setter(item[property]);
      return;
    }

    if (item.children?.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  });

  return [...items];
};

const countChildren = <T>(items: TreeItem<T>[], count = 0): number => {
  return items.reduce((acc, { children }) => {
    if (children?.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
};

export const getChildCount = <T extends Record<string, unknown>>(items: TreeItems<T>, id: UniqueIdentifier) => {
  if (!id) return 0;

  const item = findItemDeep(items, id);
  return item ? countChildren(item.children ?? []) : 0;
};

export const removeChildrenOf = <T>(items: FlattenedItem<T>[], ids: UniqueIdentifier[]) => {
  const excludeParentIds = new Set<UniqueIdentifier>(ids);

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.has(item.parentId)) {
      if (item.children?.length) {
        excludeParentIds.add(item.id);
      }
      return false;
    }

    return true;
  });
};
