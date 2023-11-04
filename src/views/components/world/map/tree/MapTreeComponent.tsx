import React, { useRef, useState } from 'react';
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
import { ReactComponent as FolderIcon } from '@assets/icons/global/folder.svg';
import { ReactComponent as FolderOpenIcon } from '@assets/icons/global/folder_open.svg';
import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { ReactComponent as CircleIcon } from '@assets/icons/global/circle.svg';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon.svg';
import { ReactComponent as DotIcon } from '@assets/icons/global/dot.svg';
import { useMapInfo } from '@utils/useMapInfo';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoFolder, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectMaps } from '@utils/useProjectData';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/inputs';
import { MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { useContextMenu } from '@utils/useContextMenu';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from '../editors/MapEditorOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MapTreeContextMenu } from './MapTreeContextMenu';

// TODO Replace it in utils
export const getCountChildren = (tree: TreeData, item: TreeItem): number => {
  let count = 0;
  item.children.forEach((childId) => {
    count++;
    if (tree.items[childId]) {
      count += getCountChildren(tree, tree.items[childId]);
    }
  });
  return count;
};

// TODO Improve this max width or find a work around
const computeMaxWidth = () => {
  return 140;
};

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

type MapTreeItemWrapperContainerProps = {
  isCurrent?: boolean;
  hasChildren: boolean;
  maxWidth: number;
  maxWidthWhenHover: number;
  disableHover?: boolean;
};

const TreeItem = styled.div<MapTreeItemWrapperContainerProps>`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  height: 35px;
  padding: 0px 8px;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text100};
  box-sizing: border-box;
  margin: 4px 0;
  ${({ theme }) => theme.fonts.normalRegular}

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ theme }) => theme.fonts.normalRegular}
    max-width: ${({ maxWidth }) => `${maxWidth}px`};
  }

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    cursor: auto;

    .left-title {
      .name {
        max-width: ${({ maxWidthWhenHover }) => `${maxWidthWhenHover}px`};
      }
    }
  }

  .left-icons {
    display: flex;
    gap: 8px;
  }

  .icon {
    display: flex;
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.text400};
    align-items: center;
    justify-content: center;
    border-radius: 2px;
  }

  .title {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .collapse-button {
    transform: rotate(-90deg);
    transition: transform 250ms ease;
    cursor: pointer;

    :hover {
      background-color: ${({ theme }) => theme.colors.dark22};
    }
  }

  .collapse-button-collapsed {
    transform: rotate(-180deg);
  }

  .count-children {
    display: flex;
    height: 18px;
    padding: 2px 4px;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryBase};
  }

  .actions {
    display: none;

    .icon-plus {
      :hover {
        background-color: ${({ theme }) => theme.colors.primarySoft};
        color: ${({ theme }) => theme.colors.primaryBase};
        cursor: pointer;
      }
    }

    .icon-dot {
      :hover {
        background-color: ${({ theme }) => theme.colors.dark22};
        cursor: pointer;
      }
    }
  }

  :hover {
    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .title.map {
      .name {
        max-width: ${({ maxWidthWhenHover }) => `${maxWidthWhenHover}px`};
      }
    }
    .title.folder {
      .name {
        max-width: ${({ hasChildren }) => (hasChildren ? '122px' : '146px')};
      }
    }
  }
`;

// TODO: remove this after mapinfo refacto
const convertMapInfo = (mapInfo: (StudioMapInfoMap | StudioMapInfoFolder)[]) => {
  const items = mapInfo.reduce((acc, item) => {
    // TODO, Check children to work
    if (item.klass === 'MapInfoFolder') {
      acc[item.id.toString()] = {
        id: item.id,
        children: cloneEntity(item.children.map((child) => child.id)),
        hasChildren: item.children.length > 0,
        isExpanded: !item.collapsed,
        isChildrenLoading: false,
        data: {
          klass: item.klass,
          textId: item.textId,
        },
      };
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
  return {
    rootId: 0,
    items,
  };
};

export const MapTreeComponent = () => {
  const { mapInfoValues: mapInfo } = useMapInfo();
  const setText = useSetProjectText();
  const { selectedDataIdentifier, projectDataValues: maps } = useProjectMaps();
  const [tree, setTree] = useState<TreeData>(convertMapInfo(mapInfo));
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap } = useProjectMaps();
  const getMapName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const { t } = useTranslation('database_maps');
  const renameRef = useRef<HTMLInputElement>(null);
  const [canRename, setCanRename] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const [isDisabledNavigation, setIsDisabledNavigation] = useState<boolean>(false);
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();

  const onExpand = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: true }));
  };

  const onCollapse = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: false }));
  };

  const getIcon = (item: TreeItem, onExpand: (itemId: string) => void, onCollapse: (itemId: string) => void) => {
    return (
      <div className="left-icons">
        {item.children && item.children.length > 0 ? (
          item.isExpanded ? (
            <span
              className="icon collapse-button"
              onClick={(e) => {
                e.preventDefault();
                onCollapse(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          ) : (
            <span
              className="icon collapse-button collapse-button-collapsed"
              onClick={(e) => {
                e.preventDefault();
                onExpand(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          )
        ) : item.data?.klass === 'MapInfoFolder' ? (
          <span className="icon" />
        ) : (
          <span className="icon">
            <CircleIcon />
          </span>
        )}
        {item.data?.klass === 'MapInfoFolder' && <span className="icon">{item.isExpanded ? <FolderOpenIcon /> : <FolderIcon />}</span>}
      </div>
    );
  };

  const mapName = (mapDbSymbol: DbSymbol) => {
    const map = maps[mapDbSymbol];
    if (!map) return t('map_deleted');

    return getMapName(map);
  };

  const getName = (item: TreeItem) => {
    if (!item.data) return '';

    const isFolder = item.data.klass === 'MapInfoFolder';
    return isFolder ? getFolderName({ klass: item.data.klass, textId: item.data.textId }) : mapName(item.data.mapDbSymbol);
  };

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isFolder = item.data.klass === 'MapInfoFolder';
    const countChildren = isFolder ? getCountChildren(tree, item) : undefined;
    const mapInfoItem = mapInfo.find((map) => map.id === item.id);
    const handleRename = () => {
      if (!renameRef.current) return setCanRename(false);
      const value = renameRef.current.value === '' ? renameRef.current.defaultValue : renameRef.current.value;

      if (isFolder) {
        setText(MAP_INFO_FOLDER_NAME_TEXT_ID, item.data.textId, value);
      } else {
        const map = maps[item.data.mapDbSymbol];
        setText(MAP_NAME_TEXT_ID, map.id, value);
      }
      setCanRename(false);
    };

    return (
      <div ref={provided.innerRef} {...provided.draggableProps}>
        <TreeItem
          isCurrent={!isFolder && item.data?.mapDbSymbol === selectedDataIdentifier}
          maxWidth={computeMaxWidth()}
          maxWidthWhenHover={computeMaxWidth() - 30}
          hasChildren={!!countChildren}
          disableHover={canRename}
          className={currentMap === item.data.mapDbSymbol ? 'map-selected' : 'map'}
          onClick={() => {
            if (!item.data.mapDbSymbol || isFolder) return;
            setCurrentMap({ map: item.data.mapDbSymbol });
          }}
          {...provided.dragHandleProps}
        >
          <div className="title">
            <span>{getIcon(item, onExpand, onCollapse)}</span>
            <span className="name">
              {canRename ? (
                <Input
                  ref={renameRef}
                  defaultValue={getName(item)}
                  placeholder={getName(item)}
                  onBlur={handleRename}
                  onKeyDown={(event) => event.key === 'Enter' && renameRef.current?.blur()}
                  className={isFolder ? 'input-folder' : 'input-map'}
                />
              ) : (
                getName(item)
              )}
            </span>
          </div>
          {isFolder && countChildren !== undefined && <span className="count-children">{countChildren}</span>}
          {/* !clone && */}
          {!canRename && (
            <div className="actions">
              <span className="icon icon-dot" onClick={buildOnClick}>
                <DotIcon />
              </span>
              {/* {depth < (mapIsInFolder({ klass: item.klass, parent }) ? 3 : 2) && !isDeleted && ( */}
              <span
                className="icon icon-plus"
                onClick={() => dialogsRef.current?.openDialog('new')}
                onMouseEnter={() => setIsDisabledNavigation(true)}
                onMouseLeave={() => setIsDisabledNavigation(false)}
              >
                <PlusIcon />
              </span>
              {/* )} */}
            </div>
          )}
          {/* TODO make menu work */}
          {mapInfoItem &&
            renderContextMenu(
              <MapTreeContextMenu mapInfo={mapInfoItem} isDeleted={isDeleted} enableRename={() => setCanRename(true)} dialogsRef={dialogsRef} />
            )}
          {/* TODO fix delete */}
          <MapEditorOverlay mapInfo={mapInfoItem} ref={dialogsRef} />
        </TreeItem>
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
    <MapListContainer>
      <Tree
        tree={tree}
        renderItem={renderItem}
        onExpand={onExpand}
        onCollapse={onCollapse}
        onDragEnd={onDragEnd}
        offsetPerLevel={30}
        isDragEnabled
        isNestingEnabled
      />
    </MapListContainer>
  );
};
