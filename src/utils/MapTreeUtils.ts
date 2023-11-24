import type { ItemId, TreeData, TreeDestinationPosition, TreeItem } from '@components/tree/types';
import { StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';
import theme from '@src/AppTheme';
import Tree from '@components/tree';

const getMapTreeItemDepth = (tree: TreeData, item: TreeItem): number => {
  if (item.data.parentId === undefined || item.data.parentId === 0) return 1;
  return 1 + getMapTreeItemDepth(tree, tree.items[item.data.parentId]);
};

export const getMapTreeCountChildren = (tree: TreeData, item: TreeItem): number => {
  let count = 0;
  item.children.forEach((childId) => {
    count++;
    if (tree.items[childId]) {
      count += getMapTreeCountChildren(tree, tree.items[childId]);
    }
  });
  return count;
};

export const getMapTreeSourceDepth = (tree: TreeData, item: TreeItem): number => {
  if (item.children.length === 0) return 1;

  const childrenDepths = item.children.map((id) => getMapTreeSourceDepth(tree, tree.items[id]));
  return 1 + Math.max(...childrenDepths);
};

export const getMapTreeDestinationDepth = (tree: TreeData, destination: TreeDestinationPosition): number => {
  if (destination.parentId === 0) return 1;

  return getMapTreeItemDepth(tree, tree.items[destination.parentId]);
};

export const mapTreeComputeMaxWidth = (depth: number, isFolder = false, hovered = false) => {
  const indentationWidth = 22;
  if (hovered) {
    if (isFolder) {
      return 150 - indentationWidth * depth;
    }
    return 145 - indentationWidth * depth;
  }
  if (isFolder) {
    return 160 - indentationWidth * depth;
  }
  return 185 - indentationWidth * depth;
};

export const renderDropBox = (targetId: string | null | undefined, treeRef: React.RefObject<Tree>) => {
  if (!treeRef.current) return;

  if (targetId) {
    const item = treeRef.current.itemsElement[targetId]?.firstChild as HTMLDivElement | undefined;
    if (!item) return;

    item.style.outline = `2px solid ${theme.colors.primaryBase}`;
    item.style.outlineOffset = '-2px';
    item.style.borderRadius = '8px';
  } else {
    // clear dropbox
    const items = Object.values(treeRef.current.itemsElement);
    items.forEach((item) => {
      const firstChild = item?.firstChild as HTMLDivElement | undefined;
      if (!firstChild) return;

      firstChild.style.outline = 'inherit';
    });
  }
};

/*
 * The tree does not change the structure of the TreeItem, whose data is provided by the mapinfo.
 * This means that the data present in the input also exists in the output.
 * The ItemId can be an Integer or a String, but this has no effect on the mapinfo.
 * So "conversions" are safe.
 */

export const mapTreeConvertTreeToMapInfo = (items: Record<ItemId, TreeItem>) => {
  return items as unknown as StudioMapInfo;
};

export const mapTreeConvertItemToMapInfoValue = (item: TreeItem) => {
  return item as unknown as StudioMapInfoValue;
};
