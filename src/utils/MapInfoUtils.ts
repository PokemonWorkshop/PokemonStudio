import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioMapInfo, StudioMapInfoFolder, StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { cloneEntity } from './cloneEntity';

const removeMapInfoChildren = (mapInfo: StudioMapInfo, id: number) => {
  const values = Object.values(mapInfo);
  const mapInfoValue = values.find((mi) => mi.children.includes(id));
  if (!mapInfoValue) return;

  mapInfoValue.children = mapInfoValue.children.filter((childId) => childId !== id);
  mapInfoValue.hasChildren = mapInfoValue.children.length > 0;
};

const getMapInfoChildrenId = (mapInfo: StudioMapInfo, mapInfoValue: StudioMapInfoValue): number[] => {
  if (mapInfoValue.children.length === 0) return [];

  const children: number[] = [...mapInfoValue.children];
  mapInfoValue.children.forEach((id) => {
    children.push(...getMapInfoChildrenId(mapInfo, mapInfo[id.toString()]));
  });
  return children;
};

export const findMapInfoMap = (mapInfo: StudioMapInfo, mapDbSymbol: DbSymbol): StudioMapInfoMap | undefined => {
  const values = Object.values(mapInfo);
  const mapInfoMap = values.find((mi) => mi.data.klass === 'MapInfoMap' && mi.data.mapDbSymbol === mapDbSymbol);
  return mapInfoMap as StudioMapInfoMap | undefined;
};

export const mapInfoFindFirstAvailableId = (mapInfo: StudioMapInfo): number => {
  const keys = Object.keys(mapInfo).map((key) => Number(key));
  if (keys.length === 0) return 0;

  const idSet = keys.sort((a, b) => a - b);
  if (idSet[0] > 0) return 0;

  const holeIndex = idSet.findIndex((id, index) => id !== index);
  if (holeIndex === -1) return idSet[idSet.length - 1] + 1;

  return idSet[holeIndex - 1] + 1;
};

export const mapInfoFindFirstAvailableTextId = (mapInfo: StudioMapInfo): number => {
  if (Object.keys(mapInfo).length === 0) return 0;

  const idSet = Object.values(mapInfo)
    .filter((mi) => mi.data.klass === 'MapInfoFolder')
    .map((folder) => (folder as StudioMapInfoFolder).data.textId)
    .sort((a, b) => a - b);

  if (idSet[0] === undefined || idSet[0] > 0) return 0;

  const holeIndex = idSet.findIndex((id, index) => id !== index);
  if (holeIndex === -1) return idSet[idSet.length - 1] + 1;

  return idSet[holeIndex - 1] + 1;
};

export const mapInfoRemoveMap = (mapInfo: StudioMapInfo, mapDbSymbol: DbSymbol): StudioMapInfo => {
  const mapInfoMap = findMapInfoMap(mapInfo, mapDbSymbol);
  if (!mapInfoMap) return mapInfo;

  const keys = [mapInfoMap.id, ...getMapInfoChildrenId(mapInfo, mapInfoMap)];
  const mapInfoCloned = cloneEntity(mapInfo);
  keys.forEach((key) => delete mapInfoCloned[key.toString()]);
  removeMapInfoChildren(mapInfoCloned, mapInfoMap.id);
  return mapInfoCloned;
};

export const mapInfoRemoveFolder = (mapInfo: StudioMapInfo, mapInfoFolder: StudioMapInfoFolder): StudioMapInfo => {
  const mapInfoValue = mapInfo[mapInfoFolder.id.toString()];
  if (!mapInfoValue) return mapInfo;

  const keys = [mapInfoValue.id, ...getMapInfoChildrenId(mapInfo, mapInfoValue)];
  const mapInfoCloned = cloneEntity(mapInfo);
  keys.forEach((key) => delete mapInfoCloned[key.toString()]);
  removeMapInfoChildren(mapInfoCloned, mapInfoValue.id);
  return mapInfoCloned;
};

export const mapInfoDuplicateMap = (mapInfo: StudioMapInfo, originalMapDbSymbol: DbSymbol, newMapInfoMap: StudioMapInfoMap): StudioMapInfo => {
  const mapInfoMap = findMapInfoMap(mapInfo, originalMapDbSymbol);
  if (!mapInfoMap) return mapInfo;

  const mapInfoWithChildren = Object.values(mapInfo).find((mi) => mi.children.includes(mapInfoMap.id));
  if (!mapInfoWithChildren) return mapInfo;

  const newMapInfo = addNewMapInfo(mapInfo, newMapInfoMap, true);
  const index = mapInfoWithChildren.children.findIndex((id) => id === mapInfoMap.id);
  newMapInfo[mapInfoWithChildren.id].children.splice(index + 1, 0, newMapInfoMap.id);
  return newMapInfo;
};

export const mapInfoGetMapsFromMapInfoValue = (mapInfo: StudioMapInfo, mapInfoValue: StudioMapInfoValue): DbSymbol[] => {
  const children = getMapInfoChildrenId(mapInfo, mapInfoValue);

  return Object.values(mapInfo)
    .filter((mi) => children.includes(mi.id) && mi.data.klass === 'MapInfoMap')
    .map((mi) => (mi as StudioMapInfoMap).data.mapDbSymbol);
};

export const mapInfoGetMapsFromMapDbSymbol = (mapInfo: StudioMapInfo, mapDbSymbol: DbSymbol): DbSymbol[] => {
  const mapInfoMap = findMapInfoMap(mapInfo, mapDbSymbol);
  if (!mapInfoMap) return [];

  return mapInfoGetMapsFromMapInfoValue(mapInfo, mapInfoMap);
};

export const mapInfoNewMapWithParent = (mapInfo: StudioMapInfo, parentId: number, newMapInfoMap: StudioMapInfoMap) => {
  if (!mapInfo[parentId.toString()]) return mapInfo;

  const newMapInfo = addNewMapInfo(mapInfo, newMapInfoMap, true);
  const newMapInfoValue = newMapInfo[parentId.toString()];
  newMapInfoValue.children.push(newMapInfoMap.id);
  newMapInfoValue.hasChildren = true;
  newMapInfoValue.isExpanded = true;

  return newMapInfo;
};

export const addNewMapInfo = (mapInfo: StudioMapInfo, newMapInfo: StudioMapInfoValue, notRoot?: true) => {
  const mapInfoCloned = cloneEntity(mapInfo);
  if (notRoot) {
    return {
      ...mapInfoCloned,
      [newMapInfo.id.toString()]: newMapInfo,
    };
  }

  const root = mapInfoCloned['0'];
  root.children.push(newMapInfo.id);
  root.hasChildren = true;
  return {
    ...mapInfoCloned,
    ['0']: root,
    [newMapInfo.id.toString()]: newMapInfo,
  };
};

export const convertMapInfoToTree = (mapInfo: StudioMapInfo) => {
  return {
    rootId: 0,
    items: cloneEntity(mapInfo),
  };
};

const getMapInfoParentIdRec = (mapInfo: StudioMapInfo, id: number): number[] => {
  const mapInfoValue = mapInfo[id.toString()];
  if (mapInfoValue.data.klass === 'MapInfoRoot') return [];
  if (mapInfoValue.data.klass === 'MapInfoFolder') return [0];

  const parentId = mapInfoValue.data.parentId;
  return [mapInfo[parentId].id, ...getMapInfoParentIdRec(mapInfo, parentId)];
};

export const getMapInfoParentId = (mapInfo: StudioMapInfo, mapInfoValue: StudioMapInfoValue) => {
  if (mapInfoValue.data.klass === 'MapInfoRoot') return [];
  if (mapInfoValue.data.klass === 'MapInfoFolder') return [0];

  const parentId = mapInfoValue.data.parentId;
  return [parentId, ...getMapInfoParentIdRec(mapInfo, parentId)].reverse();
};
