import DotIcon from '@assets/icons/global/dot.svg';
import FolderIcon from '@assets/icons/global/folder.svg';
import FolderOpenIcon from '@assets/icons/global/folder_open.svg';
import LeftIcon from '@assets/icons/global/left-icon.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { Input } from '@components/inputs';
import Tree, {
  ItemId,
  moveItemOnTree,
  mutateTree,
  RenderItemParams,
  TreeData,
  TreeDestinationPosition,
  TreeItem,
  TreeSourcePosition,
} from '@components/tree';
import { useContextMenu } from '@hooks/useContextMenu';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMaps } from '@hooks/useProjectData';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { convertMapInfoToTree } from '@utils/MapInfoUtils';
import {
  getMapTreeCountChildren,
  getMapTreeItemDepth,
  getTreeDestinationDepth,
  getTreeSourceDepth,
  mapTreeConvertItemToMapInfoValue,
  mapTreeConvertTreeToMapInfo,
  renderDropBox,
} from '@utils/MapTreeUtils';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchIsUnderOpenFolder } from '../../../tree/Tree/Tree-utils';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from '../editors/MapEditorOverlay';
import { MapTreeContextMenu } from './MapTreeContextMenu';
import { MapListContainer, TreeItemContainer } from './style';

type MapTreeComponentProps = {
  treeScrollbarRef: RefObject<HTMLDivElement | null>;
};

export const MapTreeComponent = ({ treeScrollbarRef }: MapTreeComponentProps) => {
  const { mapInfo, setMapInfo, setPartialMapInfo } = useMapInfo();
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap, projectDataValues: maps } = useProjectMaps();
  const setText = useSetProjectText();
  const getMapName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeData>(convertMapInfoToTree(mapInfo));
  const [canRename, setCanRename] = useState<ItemId>();
  const [mapInfoSelected, setMapInfoSelected] = useState<StudioMapInfoValue>();
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const treeRef = useRef<Tree>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();

  useEffect(() => {
    // Check if an item has added and is in the root children
    if (mapInfo['0'].children.length > tree.items['0'].children.length && Object.keys(mapInfo).length > Object.keys(tree.items).length) {
      setShouldScroll(true);
    }
    setTree(convertMapInfoToTree(mapInfo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfo]);

  useEffect(() => {
    if (shouldScroll && treeScrollbarRef.current) {
      treeScrollbarRef.current.scrollTop = treeScrollbarRef.current.scrollHeight;
      setShouldScroll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScroll]);

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
                e.stopPropagation();
                onCollapse(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          ) : (
            <span
              className="icon collapse-button collapse-button-collapsed"
              onClick={(e) => {
                e.stopPropagation();
                onExpand(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          )
        ) : item.data?.klass === 'MapInfoFolder' ? (
          <span className="icon">
            <span className="point-icon" />
          </span>
        ) : (
          <span className="icon">
            <span className="point-icon" />
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
    const countChildren = isFolder ? getMapTreeCountChildren(tree, item) : undefined;
    const isDeleted = item.data.klass === 'MapInfoMap' && !maps[item.data.mapDbSymbol];
    const currentDepth = getMapTreeItemDepth(tree, item);
    const isUnderOpenFolder = searchIsUnderOpenFolder(tree, item, 'MapInfoMap');

    renderDropBox(snapshot.combineWith, treeRef);

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

    const openMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      setMapInfoSelected(mapInfo[item.id]);
      // timeout to wait that the mapinfo selected has been taken into account
      setTimeout(() => buildOnClick(event, true));
    };

    return (
      <div ref={provided.innerRef} {...provided.draggableProps} key={item.id}>
        <TreeItemContainer
          isCurrent={!isFolder && item.data?.mapDbSymbol === currentMap}
          hasChildren={!!countChildren}
          disableHover={!!canRename}
          isUnderOpenFolder={isUnderOpenFolder}
          className={currentMap === item.data.mapDbSymbol ? 'item-selected' : 'item-tree'}
          onClick={() => {
            if (item.id !== canRename) {
              renameRef.current?.blur();
            }
            if (!item.data.mapDbSymbol || isFolder) return;
            if (isDeleted) return;

            setCurrentMap({ map: item.data.mapDbSymbol });
            const targetMap = maps[item.data.mapDbSymbol];
            if (!targetMap?.tiledFilename && location.pathname === '/world/overview') {
              return navigate('/world/map');
            }
            if (location.pathname !== '/world/map' && location.pathname !== '/world/overview') navigate('/world/map');
          }}
          onContextMenu={openMenu}
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
                className={isFolder ? 'input-tree-folder' : 'input-tree'}
              />
            ) : (
              <span className={`name ${isDeleted ? 'error' : ''}`}>{getName(item)}</span>
            )}
          </div>
          {isFolder && !!countChildren && <span className="count-children">{countChildren}</span>}
          {!canRename && (
            <div className="actions">
              <span className="icon icon-dot" onClick={openMenu}>
                <DotIcon />
              </span>
              {!isDeleted && currentDepth <= 3 && (
                <span
                  className="icon icon-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    const parentId = item.data?.klass === 'MapInfoMap' && item.data.parentId !== 0 ? item.data.parentId : item.id;
                    setMapInfoSelected(mapInfo[parentId]);
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
    const destinationDepth = getTreeDestinationDepth(tree, destination);
    const sourceDepth = getTreeSourceDepth(tree, currentItem);
    if (destinationDepth + sourceDepth > 4) return;

    const newTree = moveItemOnTree(tree, source, destination);

    // Update parentId in the item dropped
    if (destination.parentId !== undefined) {
      const parent = newTree.items[destination.parentId];
      // If the index doesn't exist, the item is drop at the end of the list, so it is the last children
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

  // Check if there are no maps in the tree (only root folder exists)
  const hasNoMaps = tree.items['0'] && tree.items['0'].children.length === 0;

  return (
    <MapListContainer>
      {hasNoMaps ? (
        <div className="no-item-tree">{t('no_map_found')}</div>
      ) : (
        <Tree
          ref={treeRef}
          tree={tree}
          renderItem={renderItem}
          onExpand={onExpand}
          onCollapse={onCollapse}
          onDragEnd={onDragEnd}
          offsetPerLevel={26}
          isDragEnabled={true}
          isNestingEnabled
        />
      )}
      {mapInfoSelected &&
        renderContextMenu(
          <MapTreeContextMenu
            mapInfoValue={mapInfoSelected}
            isDeleted={mapInfoSelected.data.klass === 'MapInfoMap' && !maps[mapInfoSelected.data.mapDbSymbol]}
            enableRename={() => setCanRename(mapInfoSelected.id)}
            dialogsRef={dialogsRef}
          />,
        )}
      <MapEditorOverlay mapInfoValue={mapInfoSelected} ref={dialogsRef} />
    </MapListContainer>
  );
};
