import React, { useState } from 'react';
import styled from 'styled-components';
import Tree, {
  mutateTree,
  moveItemOnTree,
  RenderItemParams,
  TreeItem,
  TreeData,
  ItemId,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '@atlaskit/tree';
import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { ReactComponent as RightIcon } from '@assets/icons/global/right-icon.svg';
import { ReactComponent as CircleIcon } from '@assets/icons/global/circle.svg';
import { useMapInfo } from '@utils/useMapInfo';
import { StudioMapInfoFolder, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { cloneEntity } from '@utils/cloneEntity';

const convertMapInfo = (mapInfo: (StudioMapInfoMap | StudioMapInfoFolder)[]) => {
  const items = mapInfo.reduce((acc, item) => {
    acc[item.id.toString()] = {
      id: item.id,
      children: cloneEntity(item.children.map((child) => child.id)),
      hasChildren: item.children.length > 0,
      isExpanded: !item.collapsed,
      isChildrenLoading: false,
      data: {
        klass: item.klass,
        name: `${item.klass} ${item.id}`,
      },
    };
    return acc;
  }, {} as Record<string, TreeItem>);
  // root item
  items['0'] = {
    id: 0,
    children: Object.keys(items),
    hasChildren: true,
    isExpanded: true,
    isChildrenLoading: false,
  };
  console.log(items);
  return {
    rootId: 0,
    items,
  };
};

export const MapTreeComponent = () => {
  const { mapInfoValues: mapInfo } = useMapInfo();
  const [tree, setTree] = useState<TreeData>(convertMapInfo(mapInfo));

  const onExpand = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: true }));
  };

  const onCollapse = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: false }));
  };

  const getIcon = (item: TreeItem, onExpand: (itemId: string) => void, onCollapse: (itemId: string) => void) => {
    if (item.children && item.children.length > 0) {
      return item.isExpanded ? (
        <button onClick={() => onCollapse(item.id.toString())}>
          <LeftIcon />
        </button>
      ) : (
        <button onClick={() => onExpand(item.id.toString())}>
          <RightIcon />
        </button>
      );
    }
    return <CircleIcon />;
  };

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    return (
      <div ref={provided.innerRef} {...provided.draggableProps}>
        {
          /*<div
            isDragging={snapshot.isDragging}
            text={item.data ? item.data.title : ''}
            icon={getIcon(item, onExpand, onCollapse)}
            dnd={{ dragHandleProps: provided.dragHandleProps }}
          />*/
          <div {...provided.dragHandleProps}>
            {getIcon(item, onExpand, onCollapse)}
            {item.data ? item.data.name : ''}
          </div>
        }
      </div>
    );
  };

  const onDragEnd = (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    if (!destination) {
      return;
    }

    const newTree = moveItemOnTree(tree, source, destination);
    setTree(newTree);
  };

  return (
    <div className="tree">
      <Tree tree={tree} renderItem={renderItem} onExpand={onExpand} onCollapse={onCollapse} onDragEnd={onDragEnd} isDragEnabled isNestingEnabled />
    </div>
  );
};
