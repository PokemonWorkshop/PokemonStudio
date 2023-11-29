import { useMemo } from 'react';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectDataReadonly } from '@utils/useProjectData';
import { useMapInfo } from '@utils/useMapInfo';
import { StudioMapInfo, StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import type { DbSymbol } from '@modelEntities/dbSymbol';
import { findMapInfoMap, getMapInfoParentId } from './MapInfoUtils';
import { assertUnreachable } from './assertUnreachable';

const getIds = (mapInfo: StudioMapInfo, mapInfoMap: StudioMapInfoMap) => {
  const parentIds = getMapInfoParentId(mapInfo, mapInfoMap);
  parentIds.push(mapInfoMap.id);
  return parentIds;
};

export const useMapBreadcrumb = (mapDbSymbol: string) => {
  const { mapInfo } = useMapInfo();
  const { projectDataValues: maps } = useProjectDataReadonly('maps', 'map');
  const getFolderMapName = useGetEntityNameTextUsingTextId();
  const getMapName = useGetEntityNameText();

  const mapInfoMap = useMemo(() => findMapInfoMap(mapInfo, mapDbSymbol as DbSymbol), [mapInfo, mapDbSymbol]);
  const ids = useMemo(() => (mapInfoMap ? getIds(mapInfo, mapInfoMap) : []), [mapInfo, mapInfoMap]);

  const getName = (mapInfoValue: StudioMapInfoValue) => {
    const data = mapInfoValue.data;
    const klass = data.klass;
    switch (klass) {
      case 'MapInfoFolder':
        return getFolderMapName({ klass: 'MapInfoFolder', textId: data.textId });
      case 'MapInfoMap':
        return getMapName({ klass: 'Map', id: maps[data.mapDbSymbol].id });
      case 'MapInfoRoot':
        return 'root';
      default:
        assertUnreachable(klass);
    }
    return '';
  };

  return ids
    .filter((id) => id !== 0)
    .map((id) => {
      const mapInfoValue = mapInfo[id.toString()];
      return {
        ...mapInfoValue.data,
        name: getName(mapInfoValue),
      };
    });
};
