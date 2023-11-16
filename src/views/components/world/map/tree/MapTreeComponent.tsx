import React, { useEffect, useRef, useState } from 'react';
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
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoValue } from '@modelEntities/mapInfo';
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
import { useMapInfo } from '@utils/useMapInfo';
import { convertMapInfoToTree } from '@utils/MapInfoUtils';
import {
  getMapTreeCountChildren,
  getMapTreeDepth,
  mapTreeComputeMaxWidth,
  mapTreeConvertItemToMapInfoValue,
  mapTreeConvertTreeToMapInfo,
  renderDropBox,
} from '@utils/MapTreeUtils';
import { MapListContainer, TreeItemContainer } from './style';

export const MapTreeComponent = () => {
  const { mapInfo, setMapInfo, setPartialMapInfo } = useMapInfo();
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap, projectDataValues: maps } = useProjectMaps();
  const setText = useSetProjectText();
  const getMapName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const { t } = useTranslation('database_maps');
  const [tree, setTree] = useState<TreeData>(convertMapInfoToTree(mapInfo));
  const [canRename, setCanRename] = useState<ItemId>();
  const [mapInfoSelected, setMapInfoSelected] = useState<StudioMapInfoValue>();
  const renameRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();

  useEffect(() => {
    setTree(convertMapInfoToTree(mapInfo));
  }, [mapInfo]);

  useEffect(() => {
    if (canRename) renameRef.current?.focus();
  }, [canRename]);

  const onExpand = (itemId: ItemId) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: true });
    setTree(newTree);
    setPartialMapInfo(mapTreeConvertItemToMapInfoValue(newTree.items[itemId]), itemId.toString());
  };

  const onCollapse = (itemId: ItemId) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: false });
    setTree(newTree);
    setPartialMapInfo(mapTreeConvertItemToMapInfoValue(newTree.items[itemId]), itemId.toString());
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

  const renderItem = ({ item, depth, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isFolder = item.data.klass === 'MapInfoFolder';
    const countChildren = isFolder ? getMapTreeCountChildren(tree, item) : undefined;
    const isDeleted = item.data.klass === 'MapInfoMap' && !maps[item.data.mapDbSymbol];

    renderDropBox(snapshot.combineWith);

    const handleRename = () => {
      if (!renameRef.current) return setCanRename(undefined);
      const value = renameRef.current.value === '' ? renameRef.current.defaultValue : renameRef.current.value;

      if (isFolder) {
        setText(MAP_INFO_FOLDER_NAME_TEXT_ID, item.data.textId, value);
      } else {
        const map = maps[item.data.mapDbSymbol];
        setText(MAP_NAME_TEXT_ID, map.id, value);
      }
      setCanRename(undefined);
    };

    return (
      <div ref={provided.innerRef} {...provided.draggableProps} key={item.id}>
        <TreeItemContainer
          isCurrent={!isFolder && item.data?.mapDbSymbol === currentMap}
          maxWidth={mapTreeComputeMaxWidth(isFolder ? depth + 1 : depth, isFolder, false)}
          maxWidthWhenHover={mapTreeComputeMaxWidth(isFolder ? depth + 1 : depth, isFolder, true)}
          hasChildren={!!countChildren}
          disableHover={!!canRename}
          className={currentMap === item.data.mapDbSymbol ? 'map-selected' : 'map'}
          onClick={() => {
            if (item.id !== canRename) {
              renameRef.current?.blur();
            }
            if (!item.data.mapDbSymbol || isFolder) return;
            if (isDeleted) return;

            setCurrentMap({ map: item.data.mapDbSymbol });
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            setMapInfoSelected(mapInfo[item.id]);
            buildOnClick(event, true);
          }}
          {...provided.dragHandleProps}
        >
          <div className="title">
            <span>{getIcon(item, onExpand, onCollapse)}</span>
            {canRename === item.id ? (
              <Input
                ref={renameRef}
                defaultValue={getName(item)}
                placeholder={getName(item)}
                onBlur={handleRename}
                onKeyDown={(event) => event.key === 'Enter' && renameRef.current?.blur()}
                className={isFolder ? 'input-folder' : 'input-map'}
              />
            ) : (
              <span className={`name ${isDeleted ? 'error' : ''}`}>{getName(item)}</span>
            )}
          </div>
          {isFolder && countChildren !== undefined && <span className="count-children">{countChildren}</span>}
          {!canRename && (
            <div className="actions">
              <span
                className="icon icon-dot"
                onClick={(event) => {
                  setMapInfoSelected(mapInfo[item.id]);
                  buildOnClick(event);
                }}
              >
                <DotIcon />
              </span>
              {!isDeleted && (
                <span
                  className="icon icon-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapInfoSelected(mapInfo[item.id]);
                    dialogsRef.current?.openDialog('new');
                  }}
                >
                  <PlusIcon />
                </span>
              )}
            </div>
          )}
        </TreeItemContainer>
      </div>
    );
  };

  const onDragEnd = (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    if (!destination) return;

    // We can only drop a folder in the root
    const currentItem = tree.items[tree.items[source.parentId].children[source.index]];
    if (currentItem.data?.klass === 'MapInfoFolder' && destination.parentId !== 0) return;

    // We can only drop a map if the depth < 5
    const depth = getMapTreeDepth(tree, tree.items[destination.parentId]);
    const sourceChildrenCount = getMapTreeCountChildren(tree, currentItem);
    if (depth + sourceChildrenCount >= 5) return;

    const newTree = moveItemOnTree(tree, source, destination);

    // Update parentId in the item dropped
    if (destination.parentId !== undefined) {
      const parent = newTree.items[destination.parentId];
      // If the index doesn't exist, the item is drop at the end of the list, so it is last children
      const index = destination.index === undefined ? parent.children.length - 1 : destination.index;
      const childId = parent.children[index];
      const treeItem = newTree.items[childId];
      if (treeItem.data?.klass === 'MapInfoMap') {
        treeItem.data.parentId = Number(destination.parentId);
      }
      parent.isExpanded = true;
    }

    setTree(newTree);
    setMapInfo(mapTreeConvertTreeToMapInfo(newTree.items));
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
      {mapInfoSelected &&
        renderContextMenu(
          <MapTreeContextMenu
            mapInfoValue={mapInfoSelected}
            isDeleted={mapInfoSelected.data.klass === 'MapInfoMap' && !maps[mapInfoSelected.data.mapDbSymbol]}
            enableRename={() => setCanRename(mapInfoSelected.id)}
            dialogsRef={dialogsRef}
          />
        )}
      <MapEditorOverlay mapInfoValue={mapInfoSelected} ref={dialogsRef} />
    </MapListContainer>
  );
};
