import type { TreeData, TreeDestinationPosition, TreeSourcePosition } from '../types';

import { addItemToTree, removeItemFromTree } from './tree';

export const moveItemOnTree = (tree: TreeData, from: TreeSourcePosition, to: TreeDestinationPosition): TreeData => {
  const { tree: treeWithoutSource, itemRemoved } = removeItemFromTree(tree, from);
  return addItemToTree(treeWithoutSource, to, itemRemoved);
};
