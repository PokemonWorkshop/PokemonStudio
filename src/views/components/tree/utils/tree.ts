import type { FlattenedItem, Path, TreeData, ItemId, TreeItem, TreeSourcePosition, TreeDestinationPosition } from '../types';

import { getParentPath, getIndexAmongSiblings } from './path';
import { mutateTree } from './mutateTree';

/*
  Transforms tree structure into flat list of items for rendering purposes.
  We recursively go through all the elements and its children first on each level
 */
export const flattenTree = (tree: TreeData, path: Path = []): FlattenedItem[] =>
  tree.items[tree.rootId]
    ? tree.items[tree.rootId].children.reduce<FlattenedItem[]>((accum, itemId, index) => {
        // iterating through all the children on the given level
        const item = tree.items[itemId];
        const currentPath = [...path, index];
        // we create a flattened item for the current item
        const currentItem = createFlattenedItem(item, currentPath);
        // we flatten its children
        const children = flattenChildren(tree, item, currentPath);
        // append to the accumulator
        return [...accum, currentItem, ...children];
      }, [])
    : [];

/*
  Constructs a new FlattenedItem
 */
const createFlattenedItem = (item: TreeItem, currentPath: Path): FlattenedItem => {
  return {
    item,
    path: currentPath,
  };
};

/*
  Flatten the children of the given subtree
*/
const flattenChildren = (tree: TreeData, item: TreeItem, currentPath: Path) => {
  return item.isExpanded ? flattenTree({ rootId: item.id, items: tree.items }, currentPath) : [];
};

export const getItem = (tree: TreeData, path: Path): TreeItem => {
  let cursor: TreeItem = tree.items[tree.rootId];

  for (const i of path) {
    cursor = tree.items[cursor.children[i]];
  }

  return cursor;
};

export const getParent = (tree: TreeData, path: Path): TreeItem => {
  const parentPath: Path = getParentPath(path);
  return getItem(tree, parentPath);
};

export const getTreePosition = (tree: TreeData, path: Path): TreeSourcePosition => {
  const parent: TreeItem = getParent(tree, path);
  const index: number = getIndexAmongSiblings(path);
  return {
    parentId: parent.id,
    index,
  };
};

const hasLoadedChildren = (item: TreeItem): boolean => !!item.hasChildren && item.children.length > 0;

const isLeafItem = (item: TreeItem): boolean => !item.hasChildren;

export const removeItemFromTree = (tree: TreeData, position: TreeSourcePosition): { tree: TreeData; itemRemoved: ItemId } => {
  const sourceParent = tree.items[position.parentId];
  const newSourceChildren = [...sourceParent.children];
  const itemRemoved = newSourceChildren.splice(position.index, 1)[0];
  const newTree = mutateTree(tree, position.parentId, {
    children: newSourceChildren,
    hasChildren: newSourceChildren.length > 0,
    isExpanded: newSourceChildren.length > 0 && sourceParent.isExpanded,
  });

  return {
    tree: newTree,
    itemRemoved,
  };
};

export const addItemToTree = (tree: TreeData, position: TreeDestinationPosition, item: ItemId): TreeData => {
  const destinationParent = tree.items[position.parentId];
  const newDestinationChildren = [...destinationParent.children];
  if (typeof position.index === 'undefined') {
    if (hasLoadedChildren(destinationParent) || isLeafItem(destinationParent)) {
      newDestinationChildren.push(item);
    }
  } else {
    newDestinationChildren.splice(position.index, 0, item);
  }
  return mutateTree(tree, position.parentId, {
    children: newDestinationChildren,
    hasChildren: true,
  });
};
