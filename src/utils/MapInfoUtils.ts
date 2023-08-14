import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioMapInfo, StudioMapInfoFolder, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { cloneEntity } from './cloneEntity';
import { TreeItem } from '@components/sortabletree/TreeTypes';

export const mapInfoFindFirstAvailableId = (mapInfo: StudioMapInfo[]): number => {
  const read = (mapInfo: StudioMapInfo[]): number[] => {
    return mapInfo.map((mi) => [...read(mi.children), mi.id]).flat();
  };

  if (mapInfo.length === 0) return 1;

  const idSet = read(mapInfo).sort((a, b) => a - b);
  if (idSet[0] > 1) return 1;

  const holeIndex = idSet.findIndex((id, index) => id !== index + 1);
  if (holeIndex === -1) return idSet[idSet.length - 1] + 1;

  return idSet[holeIndex - 1] + 1;
};

export const mapInfoFindFirstAvailableTextId = (mapInfo: StudioMapInfo[]): number => {
  if (mapInfo.length === 0) return 0;

  const idSet = mapInfo
    .filter((mi) => mi.klass === 'MapInfoFolder')
    .map((folder) => (folder as StudioMapInfoFolder).textId)
    .sort((a, b) => a - b);

  if (idSet[0] === undefined || idSet[0] > 0) return 0;

  const holeIndex = idSet.findIndex((id, index) => id !== index);
  if (holeIndex === -1) return idSet[idSet.length - 1] + 1;

  return idSet[holeIndex - 1] + 1;
};

export const mapInfoRemoveMap = (mapInfo: StudioMapInfo[], mapDbSymbol: DbSymbol) => {
  const mapInfoCloned = cloneEntity(mapInfo);
  const index = mapInfoCloned.findIndex((mi) => mi.klass === 'MapInfoMap' && mi.mapDbSymbol === mapDbSymbol);
  if (index === -1) {
    mapInfoCloned.some((mi) => mapInfoRemoveMapRec(mi.children, mapDbSymbol));
    return mapInfoCloned;
  }

  mapInfoCloned.splice(index, 1);
  return mapInfoCloned;
};

const mapInfoRemoveMapRec = (mapInfo: StudioMapInfoMap[], mapDbSymbol: DbSymbol): boolean => {
  const index = mapInfo.findIndex((mi) => mi.mapDbSymbol === mapDbSymbol);
  if (index === -1) {
    return mapInfo.some((mi) => mapInfoRemoveMapRec(mi.children, mapDbSymbol));
  }

  mapInfo.splice(index, 1);
  return true;
};

export const mapInfoRemoveFolder = (mapInfo: StudioMapInfo[], mapInfoFolder: StudioMapInfoFolder): StudioMapInfo[] => {
  const mapInfoCloned = cloneEntity(mapInfo);
  const index = mapInfoCloned.findIndex((mi) => mi.id === mapInfoFolder.id);
  if (index === -1) return mapInfoCloned;

  mapInfoCloned.splice(index, 1);
  return mapInfoCloned;
};

export const mapInfoDuplicateMap = (mapInfo: StudioMapInfo[], originalMapDbSymbol: DbSymbol, newMapInfoMap: StudioMapInfoMap): StudioMapInfo[] => {
  const mapInfoCloned = cloneEntity(mapInfo);
  const index = mapInfoCloned.findIndex((mi) => mi.klass === 'MapInfoMap' && mi.mapDbSymbol === originalMapDbSymbol);

  if (index === -1) {
    mapInfoCloned.some((mi) => mapInfoDuplicateMapRec(mi.children, originalMapDbSymbol, newMapInfoMap));
    return mapInfoCloned;
  }

  mapInfoCloned.splice(index + 1, 0, newMapInfoMap);
  return mapInfoCloned;
};

const mapInfoDuplicateMapRec = (mapInfo: StudioMapInfoMap[], originalMapDbSymbol: DbSymbol, newMapInfoMap: StudioMapInfoMap): boolean => {
  const index = mapInfo.findIndex((mi) => mi.mapDbSymbol === originalMapDbSymbol);
  if (index === -1) {
    return mapInfo.some((mi) => mapInfoDuplicateMapRec(mi.children, originalMapDbSymbol, newMapInfoMap));
  }

  mapInfo.splice(index + 1, 0, newMapInfoMap);
  return true;
};

export const mapInfoGetMapsFromFolder = (mapInfoFolder: StudioMapInfoFolder): DbSymbol[] => {
  return [...mapInfoFolder.children.map((child) => mapInfoGetMapsRec(child)).flat()];
};

export const mapInfoGetMapsFromMapDbSymbol = (mapInfo: StudioMapInfo[], mapDbSymbol: DbSymbol): DbSymbol[] => {
  const mapInfoMapFound = mapInfo.find((mi) => mi.klass === 'MapInfoMap' && mi.mapDbSymbol === mapDbSymbol);
  if (mapInfoMapFound) {
    return [...mapInfoMapFound.children.map((child) => mapInfoGetMapsRec(child)).flat()];
  }
  return mapInfo.map((mi) => mapInfoGetMapsFromMapDbSymbol(mi.children, mapDbSymbol)).flat();
};

const mapInfoGetMapsRec = (mapInfoMap: StudioMapInfoMap): DbSymbol[] => {
  return [mapInfoMap.mapDbSymbol, ...mapInfoMap.children.map((child) => mapInfoGetMapsRec(child)).flat()];
};

export const mapInfoNewMapWithParent = (mapInfo: StudioMapInfo[], parentId: number, newMapInfoMap: StudioMapInfoMap) => {
  const mapInfoCloned = cloneEntity(mapInfo);
  const mapInfoFound = mapInfoCloned.find((mi) => mi.id === parentId);
  if (mapInfoFound) {
    mapInfoFound.collapsed = false;
    mapInfoFound.children.push(newMapInfoMap);
    return mapInfoCloned;
  }

  mapInfoCloned.some((mi) => mapInfoNewMapWithParentRec(mi.children, parentId, newMapInfoMap));
  return mapInfoCloned;
};

const mapInfoNewMapWithParentRec = (mapInfoMaps: StudioMapInfoMap[], parentId: number, newMapInfoMap: StudioMapInfoMap): boolean => {
  const mapInfoFound = mapInfoMaps.find((mi) => mi.id === parentId);
  if (mapInfoFound) {
    mapInfoFound.collapsed = false;
    mapInfoFound.children.push(newMapInfoMap);
    return true;
  }
  return mapInfoMaps.some((mi) => mapInfoNewMapWithParentRec(mi.children, parentId, newMapInfoMap));
};

export const buildMapInfo = (items: TreeItem<StudioMapInfo>[] & StudioMapInfo[]): StudioMapInfo[] => {
  return items.map((item) => {
    if (item.klass === 'MapInfoFolder') {
      return {
        klass: item.klass,
        id: item.id,
        textId: item.textId,
        collapsed: item.collapsed,
        children: buildMapInfoRec(item.children),
      };
    } else {
      return {
        klass: item.klass,
        id: item.id,
        mapDbSymbol: item.mapDbSymbol,
        collapsed: item.collapsed,
        children: buildMapInfoRec(item.children),
      };
    }
  });
};

const buildMapInfoRec = (mapInfoMaps: TreeItem<StudioMapInfoMap>[] & StudioMapInfoMap[]): StudioMapInfoMap[] => {
  return mapInfoMaps.map((mapInfo) => ({
    klass: 'MapInfoMap',
    id: mapInfo.id,
    mapDbSymbol: mapInfo.mapDbSymbol,
    collapsed: mapInfo.collapsed,
    children: buildMapInfoRec(mapInfo.children),
  }));
};
