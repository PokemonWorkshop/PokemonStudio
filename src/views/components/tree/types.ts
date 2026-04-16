export type ItemId = string | number;

export interface TreeData {
  rootId: ItemId;
  items: Record<ItemId, TreeItem>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TreeItemData = any;

export type TreeItem = {
  id: ItemId;
  children: ItemId[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  isChildrenLoading?: boolean;
  data?: TreeItemData;
};

export type FlattenedTree = FlattenedItem[];

export type Path = number[];

export type FlattenedItem = {
  item: TreeItem;
  path: Path;
};

export type TreeSourcePosition = {
  parentId: ItemId;
  index: number;
};

export type TreeDestinationPosition = {
  parentId: ItemId;
  index?: number;
};
