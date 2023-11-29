/*
  Changes the tree data structure with minimal reference changes.
 */
import type { ItemId, TreeData, TreeItemData } from '../types';

export type TreeItemMutation = {
  id?: ItemId;
  children?: ItemId[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  isChildrenLoading?: boolean;
  data?: TreeItemData;
};

export const mutateTree = (tree: TreeData, itemId: ItemId, mutation: TreeItemMutation): TreeData => {
  const itemToChange = tree.items[itemId];
  if (!itemToChange) {
    // Item not found
    return tree;
  }
  // Returning a clone of the tree structure and overwriting the field coming in mutation
  return {
    // rootId should not change
    rootId: tree.rootId,
    items: {
      // copy all old items
      ...tree.items,
      // overwriting only the item being changed
      [itemId]: {
        ...itemToChange,
        ...mutation,
      },
    },
  };
};
