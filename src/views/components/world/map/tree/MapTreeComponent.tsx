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
} from '@components/tree';
import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { ReactComponent as RightIcon } from '@assets/icons/global/right-icon.svg';
import { ReactComponent as CircleIcon } from '@assets/icons/global/circle.svg';
import { useMapInfo } from '@utils/useMapInfo';
import { StudioMapInfoFolder, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectMaps } from '@utils/useProjectData';

const MapListContainer = styled.div`
  height: calc(100vh - 291px);

  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 3px;

  .map,
  .map-selected {
    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};
    }
  }

  .map-selected {
    background-color: ${({ theme }) => theme.colors.dark20};
    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};
    }
  }

  & .scrollable-view {
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.dark12};
      opacity: 0.8;
      box-sizing: border-box;
      border: 1px solid ${({ theme }) => theme.colors.text500};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: ${({ theme }) => theme.colors.dark15};
      border-color: ${({ theme }) => theme.colors.text400};
    }
    .no-maps {
      ${({ theme }) => theme.fonts.normalRegular}
      color: ${({ theme }) => theme.colors.text400};
      padding: 9.5px 15px;
    }
  }
`;

const TreeItem = styled.div`
  display: flex;
  height: 35px;
  padding: 0px 8px;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text100};
  box-sizing: border-box;
  margin: 4px 0;

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ theme }) => theme.fonts.normalRegular}
  }

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }

  svg,
  button {
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text400};
    height: 18px;
    width: 18px;
  }
  button {
    height: 12px;
  }
`;

const convertMapInfo = (mapInfo: (StudioMapInfoMap | StudioMapInfoFolder)[]) => {
  const items = mapInfo.reduce((acc, item) => {
    // TODO, Check children to work
    if (item.klass === 'MapInfoFolder') {
      return acc;
    }
    acc[item.id.toString()] = {
      id: item.id,
      children: cloneEntity(item.children.map((child) => child.id)),
      hasChildren: item.children.length > 0,
      isExpanded: !item.collapsed,
      isChildrenLoading: false,
      data: {
        klass: item.klass,
        name: `${item.klass} ${item.id}`,
        mapDbSymbol: item.mapDbSymbol,
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
  const [isDraging, setIsDraging] = useState<ItemId | undefined>();
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap } = useProjectMaps();

  const onExpand = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: true }));
  };

  const onCollapse = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: false }));
  };

  const onDragStart = (itemId: ItemId) => {
    setIsDraging(itemId);
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
        <TreeItem
          className={currentMap === item.data.mapDbSymbol ? 'map-selected' : 'map'}
          onClick={() => {
            console.log(item, currentMap);
            if (!item.data.mapDbSymbol || item.data.klass === 'MapInfoFolder') return;
            setCurrentMap({ map: item.data.mapDbSymbol });
          }}
          {...provided.dragHandleProps}
        >
          {getIcon(item, onExpand, onCollapse)}
          {item.data ? item.data.name : ''}
        </TreeItem>
      </div>
    );
  };

  const onDragEnd = (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    setIsDraging(undefined);

    if (!destination) {
      return;
    }

    const newTree = moveItemOnTree(tree, source, destination);
    setTree(newTree);
  };

  return (
    <MapListContainer>
      <Tree
        tree={tree}
        renderItem={renderItem}
        onExpand={onExpand}
        onDragStart={onDragStart}
        onCollapse={onCollapse}
        onDragEnd={onDragEnd}
        isDragEnabled
        isNestingEnabled
      />
    </MapListContainer>
  );
};
