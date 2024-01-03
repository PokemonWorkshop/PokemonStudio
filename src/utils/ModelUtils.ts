import { StudioTextInfo } from '@modelEntities/textInfo';
import { ProjectData } from '@src/GlobalStateProvider';

/**
 * Find the first available text id
 * @param allData The project data containing the abilities or types
 * @returns The text id
 */
export const findFirstAvailableTextId = (allData: ProjectData['abilities'] | ProjectData['types'] | StudioTextInfo[]) => {
  const textIdSet = Object.values(allData)
    .map(({ textId }) => textId) // Fetch all ids
    .filter((textId, index, array) => index === array.indexOf(textId)) // reject all duplicates
    .sort((a, b) => a - b); // sort id by ascending order
  // Since textIds are ordered, if the first isn't the startId that means we need to fill the beginning of the list ;)
  if (textIdSet[0] !== 0) return 0;

  const holeIndex = textIdSet.findIndex((textId, index) => textId !== index);
  if (holeIndex === -1) return textIdSet[textIdSet.length - 1] + 1;

  return textIdSet[holeIndex - 1] + 1;
};

/**
 * Find the first available id
 * @param allData The project data containing the data (items, moves, etc.)
 * @param startId The first id usable
 * @param excludeIds Exclude ids that are not to be used
 * @returns The first available id
 */
export const findFirstAvailableId = (allData: Record<string, { id: number }>, startId: number, excludeIds?: number[]) => {
  const values = Object.values(allData);
  if (excludeIds) values.push(...excludeIds.map((id) => ({ id })));
  if (values.length === 0) return startId;

  const idSet = values
    .map(({ id }) => id) // Fetch all ids
    .filter((id, index, array) => index === array.indexOf(id)) // reject all duplicates
    .sort((a, b) => a - b); // sort id by ascending order
  // Since ids are ordered, if the first isn't the startId that means we need to fill the beginning of the list ;)
  if (idSet[0] > startId) return startId;

  const holeIndex = idSet.findIndex((id, index) => id !== index + startId);
  if (holeIndex === -1) return idSet[idSet.length - 1] + 1;

  return idSet[holeIndex - 1] + 1;
};

export const findFirstAndSecondAvailableId = (allData: Record<string, { id: number }>, startId: number, excludeIds?: number[]) => {
  const firstId = findFirstAvailableId(allData, startId, excludeIds);
  const newAllData = {
    ...allData,
    [`data_${firstId}`]: { id: firstId },
  };
  const secondId = findFirstAvailableId(newAllData, startId, excludeIds);
  return { firstId, secondId };
};
