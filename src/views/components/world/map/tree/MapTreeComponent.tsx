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
import { MapListContainer, TreeItemContainer } from './style/MapTreeComponent';

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
  return 120;
};

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

export const MapTreeComponent = ({ mapInfos }: { mapInfos: (StudioMapInfoMap | StudioMapInfoFolder)[] }) => {
  // const { mapInfoValues: mapInfos } = useMapInfo();
  const setText = useSetProjectText();
  const [tree, setTree] = useState<TreeData>(convertMapInfo(mapInfos));
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
  const [mapInfoSelected, setMapInfoSelected] = useState<StudioMapInfoMap | StudioMapInfoFolder>();

  useEffect(() => {
    setTree(convertMapInfo(mapInfos));
  }, [mapInfos]);

  useEffect(() => {
    const mapInfo = mapInfos.find((map) => map.id === idSelected);
    if (mapInfo) {
      setMapInfoSelected(mapInfo);
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

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isFolder = item.data.klass === 'MapInfoFolder';
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
          maxWidth={computeMaxWidth()}
          maxWidthWhenHover={computeMaxWidth() - 30}
          hasChildren={!!countChildren}
          disableHover={!!canRename}
          className={currentMap === item.data.mapDbSymbol ? 'map-selected' : 'map'}
          onClick={() => {
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
                onClick={(e) => {
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
      {idSelected &&
        mapInfoSelected &&
        renderContextMenu(
          <MapTreeContextMenu
            mapInfo={mapInfoSelected}
            isDeleted={isDeleted}
            enableRename={() => {
              setCanRename(idSelected);
            }}
            dialogsRef={dialogsRef}
          />
        )}
      <MapEditorOverlay mapInfo={mapInfoSelected} ref={dialogsRef} />
    </MapListContainer>
  );
};
