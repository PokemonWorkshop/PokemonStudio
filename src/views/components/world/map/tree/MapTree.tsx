import React, { useState, useEffect, forwardRef } from 'react';
import { SortableTree } from '@components/sortabletree/SortableTree';
import { FlattenedItem, ProjectionItem, TreeItemComponentProps } from '@components/sortabletree/TreeTypes';
import { MapTreeItemWrapper } from './MapTreeItemWrapper';
import styled from 'styled-components';
import { Input } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { StudioMapInfo } from '@modelEntities/mapInfo';
import { useProjectMaps } from '@utils/useProjectData';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useMapInfo } from '@utils/useMapInfo';
import { findMaxDepth, getCountChildren, mapIsInFolder } from '@utils/MapTreeUtils';
import { cloneEntity } from '@utils/cloneEntity';
import { emitScrollContextMenu } from '@utils/useContextMenu';
import { buildMapInfo } from '@utils/MapInfoUtils';

const MapTreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .tree-scrollbar {
    height: calc(100vh - 291px);
    overflow-y: scroll;
    margin-right: -9px; //-10px

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
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 3px; //2px
  }

  ${Input} {
    height: 35px;
  }
`;

export const MapTree = () => {
  const { mapInfoValues: mapInfo, setMapInfoValues: setMapInfo } = useMapInfo();
  const [items, setItems] = useState(cloneEntity(mapInfo));
  const [saveFlipFlap, setSaveFlipFlap] = useState(false);
  const [research, setResearch] = useState('');
  const { t } = useTranslation('database_maps');

  useEffect(() => {
    setMapInfo(buildMapInfo(items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveFlipFlap]);

  useEffect(() => {
    setItems(cloneEntity(mapInfo));
  }, [mapInfo]);

  const mapTreeLimitation = (activeItem: FlattenedItem<StudioMapInfo> | null | undefined, projected: ProjectionItem<StudioMapInfo>) => {
    const isProjectedInFolder = projected && mapIsInFolder({ klass: projected.current.klass, parent: projected.parent });
    // the depth limit is 3
    if (projected && projected.depth > (isProjectedInFolder ? 3 : 2)) return true;

    // the folder can be only in the root
    if (activeItem?.klass === 'MapInfoFolder' && projected && projected.depth > 0) return true;

    // check the depth limit with the children
    if (activeItem && projected) {
      const result = findMaxDepth(activeItem) - 1;
      if (result + projected.depth > 3) return true;
    }

    return false;
  };

  return (
    <MapTreeContainer>
      <Input value={research} onChange={(event) => setResearch(event.target.value)} placeholder={t('map_research')} />
      <div className="tree-scrollbar" onScroll={emitScrollContextMenu}>
        <div className="tree">
          {
            <SortableTree<StudioMapInfo>
              items={items}
              onItemsChanged={(value) => {
                setSaveFlipFlap((flipFlap) => !flipFlap);
                setItems(value);
              }}
              TreeItemComponent={MapTreeItemComponent}
              sortableTreeLimitation={mapTreeLimitation}
            />
          }
        </div>
      </div>
    </MapTreeContainer>
  );
};

const MapTreeItemComponent = forwardRef<HTMLDivElement, TreeItemComponentProps<StudioMapInfo>>((props, ref) => {
  const { projectDataValues: maps } = useProjectMaps();
  const getMapName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const { t } = useTranslation('database_maps');
  const mapInfo = props.item;
  const isFolder = mapInfo.klass === 'MapInfoFolder';
  const isDeleted = isFolder ? false : maps[mapInfo.mapDbSymbol] === undefined;
  const countChildren = isFolder ? getCountChildren(mapInfo.children) : undefined;

  const mapName = (mapDbSymbol: DbSymbol) => {
    const map = maps[mapDbSymbol];
    if (!map) return t('map_deleted');

    return getMapName(map);
  };

  const name = isFolder ? getFolderName(mapInfo) : mapName(mapInfo.mapDbSymbol);

  return (
    <MapTreeItemWrapper
      {...props}
      ref={ref}
      isDeleted={isDeleted}
      countChildren={countChildren}
      contentClassName={isFolder ? 'folder' : 'map'}
      indentationWidth={22}
      defaultName={name}
    >
      <span className={isDeleted ? 'error' : 'name'}>{name}</span>
    </MapTreeItemWrapper>
  );
});
MapTreeItemComponent.displayName = 'MapTreeItemComponent';
