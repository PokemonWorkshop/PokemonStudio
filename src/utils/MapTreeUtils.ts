import type { ItemId, TreeData, TreeItem } from '@components/tree/types';
import { getMapInfoParentId } from './MapInfoUtils';
import { StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';

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

export const mapTreeComputeMaxWidth = (depth: number, isFolder = false, hovered = false) => {
  const indentationWidth = 30;
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

export const getMapTreeDepth = (tree: TreeData, item: TreeItem): number => {
  const parentIds = getMapInfoParentId(tree.items as unknown as StudioMapInfo, item as unknown as StudioMapInfoValue);
  return parentIds.length + 1;
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
