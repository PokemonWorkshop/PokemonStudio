import type { StudioMapInfo } from '@modelEntities/mapInfo';
import type { FlattenedItem, TreeItem } from '@components/sortabletree/TreeTypes';
import type { TreeItemStudioMapInfo } from '@components/world/map/tree/MapTreeItemWrapper';

export const getCountChildren = (children: TreeItem<StudioMapInfo>[] & StudioMapInfo[]): number => {
  let count = 0;

  children.forEach((child) => {
    count++;
    count += getCountChildren(child.children);
  });
  return count;
};

export const findMaxDepth = (item: (FlattenedItem<StudioMapInfo> | TreeItem<StudioMapInfo>) & StudioMapInfo): number => {
  if (item.children.length === 0) {
    return 1;
  }

  let maxDepth = 0;
  item.children.forEach((child) => {
    const childDepth = findMaxDepth(child);
    maxDepth = Math.max(maxDepth, childDepth);
  });

  return maxDepth + 1;
};

export const mapIsInFolder = (current: { klass: 'MapInfoFolder' | 'MapInfoMap'; parent: FlattenedItem<TreeItemStudioMapInfo> | null }): boolean => {
  const parent = current.parent;
  if (parent === null) {
    return current.klass === 'MapInfoFolder';
  }
  return mapIsInFolder(parent);
};
