import AbilityModel from '@modelEntities/ability/Ability.model';
import TypeModel from '@modelEntities/type/Type.model';
import { ProjectData } from '@src/GlobalStateProvider';

/**
 * Find the first available text id
 * @param allData The project data containing the abilities or types
 * @returns The text id
 */
export const findFirstAvailableTextId = (allData: ProjectData['abilities'] | ProjectData['types']) => {
  const abilitySortTextId: TypeModel[] | AbilityModel[] = Object.entries(allData)
    .map(([, data]) => data)
    .sort((a, b) => a.textId - b.textId);
  const holeIndex = abilitySortTextId.findIndex((ability, index) => ability.textId !== index);
  if (holeIndex === -1) return abilitySortTextId[abilitySortTextId.length - 1].textId + 1;
  if (holeIndex === 0) return 0;

  return abilitySortTextId[holeIndex - 1].textId + 1;
};

/**
 * Find the first available id
 * @param allData The project data containing the data (items, moves, etc.)
 * @param startId The first id usable
 * @returns The first available id
 */
export const findFirstAvailableId = (allData: ProjectData[''], startId: number) => {
  const dataSort = Object.entries(allData)
    .map(([, data]) => data)
    .sort((a, b) => a.id - b.id);
  const holeIndex = dataSort.findIndex((data, index) => data.id !== index + startId && index >= startId);
  if (holeIndex === -1) return dataSort[dataSort.length - 1].id + 1;
  if (holeIndex === startId) return startId;

  return dataSort[holeIndex - 1].id + 1;
};
