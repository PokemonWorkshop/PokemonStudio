import { ProjectData } from '@src/GlobalStateProvider';

import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectDataReadonly } from '@utils/useProjectData';
import { useMapInfo } from '@utils/useMapInfo';
import { StudioMapInfoMap, StudioMapInfoFolder } from '@modelEntities/mapInfo';

import type { DbSymbol } from '@modelEntities/dbSymbol';

export const getSelectedMapDbSymbol = (maps: ProjectData['maps'], mapDbSymbols: DbSymbol[], currentDbSymbol: DbSymbol): DbSymbol => {
  const mapsAvailable = Object.entries(maps)
    .map(([value, mapData]) => ({ dbSymbol: value, index: mapData.id }))
    .filter((mapDb) => !mapDbSymbols.includes(mapDb.dbSymbol as DbSymbol))
    .sort((a, b) => a.index - b.index);
  const currentAvailable = mapsAvailable.find((mapAvailable) => mapAvailable.dbSymbol === currentDbSymbol);
  if (currentAvailable) return currentAvailable.dbSymbol as DbSymbol;

  return (mapsAvailable[0]?.dbSymbol || '__undef__') as DbSymbol;
};

export const useMapBreadcrumb = (mapDbSymbol: string) => {
  const { mapInfo } = useMapInfo();

  const pathArr =
    Object.values(mapInfo)
      .map((item) => getMapPathArr(item, mapDbSymbol))
      .find((pathArr) => pathArr.length > 0) || [];

  const { projectDataValues: maps } = useProjectDataReadonly('maps', 'map');
  const getFolderMapName = useGetEntityNameTextUsingTextId();
  const getMapName = useGetEntityNameText();

  const arr: { klass: string; name: string; mapDbSymbol?: string }[] = [];

  pathArr.forEach((_, index) => {
    const klass = pathArr[index].klass;
    const selected = pathArr[index].selected;
    const isFolder = klass === 'MapInfoFolder';

    if (isFolder) {
      arr.push({
        klass,
        name: getFolderMapName({ klass: 'MapInfoFolder', textId: Number(selected) }),
      });
    }

    if (!isFolder) {
      arr.push({
        klass,
        name: getMapName({ klass: 'Map', id: maps[selected].id }),
        mapDbSymbol: selected,
      });
    }
  });

  return arr;
};

const getMapPathArr = (object: StudioMapInfoMap | StudioMapInfoFolder, search: string): MapPath[] => {
  const klass = object.data.klass || 'root';
  if (object.data.klass == 'MapInfoMap') {
    if (object.data.mapDbSymbol === search) return [{ klass, selected: object.data.mapDbSymbol }];
  }

  if (object.children || Array.isArray(object)) {
    const children = Array.isArray(object) ? object : object.children;
    for (const child of children) {
      const result = getMapPathArr(child, search);
      if (result.length > 0) {
        const data = object.data;
        if (data.klass == 'MapInfoFolder') result.unshift({ klass, selected: data.textId.toString() });
        if (data.klass == 'MapInfoMap') result.unshift({ klass, selected: data.mapDbSymbol });
        return result;
      }
    }
  }
  return [] as MapPath[];
};

type MapPath = {
  klass: string;
  selected: string;
};
