import { DragState } from './Tree-types';
import { getTreePosition } from '../utils/tree';
import { getDestinationPath, getSourcePath } from '../utils/flat-tree';
import { Path, TreeSourcePosition, TreeDestinationPosition, TreeData, FlattenedTree, TreeItem } from '../types';

/* Translates a drag&drop movement from an index based position to a relative (parent, index) position */
export const calculateFinalDropPositions = (
  tree: TreeData,
  flattenedTree: FlattenedTree,
  dragState: DragState,
  horizontalLevel: number,
): {
  sourcePosition: TreeSourcePosition;
  destinationPosition?: TreeDestinationPosition;
} => {
  const { source, destination, combine } = dragState;
  const sourcePath: Path = getSourcePath(flattenedTree, source.index);
  const sourcePosition: TreeSourcePosition = getTreePosition(tree, sourcePath);

  if (combine) {
    return {
      sourcePosition,
      destinationPosition: {
        parentId: combine.draggableId,
      },
    };
  }

  if (!destination) {
    return { sourcePosition, destinationPosition: undefined };
  }

  const destinationPath: Path = getDestinationPath(flattenedTree, source.index, destination.index, horizontalLevel);
  const destinationPosition: TreeDestinationPosition = {
    ...getTreePosition(tree, destinationPath),
  };
  return { sourcePosition, destinationPosition };
};

export const searchIsUnderOpenFolder = (tree: TreeData, item: TreeItem, klass: 'MapInfoMap' | 'EventFolder') => {
  if (item.data.klass === klass && item.data.parentId !== 0) return false;

  const rootItem = tree.items['0'];
  const index = rootItem.children.findIndex((itemId) => itemId === item.id);
  if (index === 0) return false;

  const previousId = rootItem.children[index - 1];
  return tree.items[previousId]?.isExpanded || false;
};
