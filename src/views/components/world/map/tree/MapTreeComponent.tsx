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
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfo, StudioMapInfoValue } from '@modelEntities/mapInfo';
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
import { MapListContainer, TreeItemContainer } from './style/MapTreeComponent';
import { useMapInfo } from '@utils/useMapInfo';
import { convertMapInfoToTreeItem } from '@utils/MapInfoUtils';

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

const computeMaxWidth = (depth: number, hovered = false) => {
  const indentationWidth = 22;
  if (hovered) {
    return 130 - indentationWidth * depth;
  }
  return 154 - indentationWidth * depth;
};

export const MapTreeComponent = () => {
  const { mapInfo, setMapInfo } = useMapInfo();
  // const [items, setItems] = useState(cloneEntity(mapInfos));
  const setText = useSetProjectText();
  const [tree, setTree] = useState<TreeData>(convertMapInfoToTreeItem(mapInfo));
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap, projectDataValues: maps } = useProjectMaps();
  const getMapName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const { t } = useTranslation('database_maps');
  const renameRef = useRef<HTMLInputElement>(null);
  const [canRename, setCanRename] = useState<ItemId>();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const [isDisabledNavigation, setIsDisabledNavigation] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const [idSelected, setIdSelected] = useState<ItemId>();
  const [mapInfoSelected, setMapInfoSelected] = useState<StudioMapInfoValue>();

  useEffect(() => {
    setTree(convertMapInfoToTreeItem(mapInfo));
  }, [mapInfo]);

  useEffect(() => {
    if (idSelected === undefined) return;

    const mapInfoSelected = mapInfo[idSelected];
    if (mapInfoSelected) {
      setMapInfoSelected(mapInfoSelected);
    }
  }, [idSelected]);

  useEffect(() => {
    if (canRename) renameRef.current?.focus();
  }, [canRename]);

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

  const renderItem = ({ item, depth, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isFolder = item.data.klass === 'MapInfoFolder';
    //console.log(item);
    const countChildren = isFolder ? getCountChildren(tree, item) : undefined;

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
          maxWidth={computeMaxWidth(isFolder ? depth + 1 : depth, false)}
          maxWidthWhenHover={computeMaxWidth(isFolder ? depth + 1 : depth, true)}
          hasChildren={!!countChildren}
          disableHover={!!canRename}
          className={currentMap === item.data.mapDbSymbol ? 'map-selected' : 'map'}
          onClick={() => {
            console.log(item);

            if (!item.data.mapDbSymbol || isFolder || isDisabledNavigation) return;
            setCurrentMap({ map: item.data.mapDbSymbol });
          }}
          {...provided.dragHandleProps}
        >
          <div className="title">
            <span>{getIcon(item, onExpand, onCollapse)}</span>
            <span className="name">
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
                getName(item)
              )}
            </span>
          </div>
          {isFolder && countChildren !== undefined && <span className="count-children">{countChildren}</span>}
          {!canRename && (
            <div className="actions">
              <span
                className="icon icon-dot"
                onClick={(e) => {
                  setIdSelected(item.id);
                  buildOnClick(e);
                }}
              >
                <DotIcon />
              </span>
              <span
                className="icon icon-plus"
                onClick={() => {
                  setMapInfoSelected(mapInfo[item.id]);
                  dialogsRef.current?.openDialog('new');
                }}
                onMouseEnter={() => setIsDisabledNavigation(true)}
                onMouseLeave={() => setIsDisabledNavigation(false)}
              >
                <PlusIcon />
              </span>
            </div>
          )}
        </TreeItemContainer>
      </div>
    );
  };

  const onDragEnd = (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    if (!destination || (tree.items[destination.parentId].data?.isChildren && tree.items[destination.parentId].data?.klass === 'MapInfoMap')) {
      return;
    }

    const newTree = moveItemOnTree(tree, source, destination);
    /*if (destination.parentId) {
      const becameChild = newTree.items[destination.parentId].children;

      for (const iterator of becameChild) {
        newTree.items[iterator].data.isChildren = true;
      }
      // Make child in item, for easier conversion
      newTree.items[destination.parentId].data.children = mapInfo.filter((map) => becameChild.find((c) => map.id === Number(c)));
    } else if (destination.index && source.parentId) {
      newTree.items[source.parentId].data.isChildren = false;
    }*/

    // TODO newTree seems to not change index of item, so mapInfo cant be trigger for changes

    // update parentId
    if (destination.parentId !== undefined) {
      const parent = newTree.items[destination.parentId];
      // If the index doesn't exist, the item is drop at the end of the list, so it is last children
      const index = destination.index === undefined ? parent.children.length - 1 : destination.index;
      const childId = parent.children[index];
      const treeItem = newTree.items[childId];
      if (treeItem.data.klass === 'MapInfoMap') {
        treeItem.data.parentId = Number(destination.parentId);
      }
    }

    setTree(newTree);
    setMapInfo(newTree.items as unknown as StudioMapInfo);
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
      {idSelected &&
        mapInfoSelected &&
        renderContextMenu(
          <MapTreeContextMenu
            mapInfoValue={mapInfoSelected}
            isDeleted={isDeleted}
            enableRename={() => {
              setCanRename(idSelected);
            }}
            dialogsRef={dialogsRef}
          />
        )}
      <MapEditorOverlay mapInfoValue={mapInfoSelected} ref={dialogsRef} />
      {/*<button
        onClick={() => {
          console.log(mapInfos, tree);
          setMapInfo(convertTreeToMapInfo(tree));
        }}
      >
        Convertisser moi
      </button>*/}
    </MapListContainer>
  );
};
