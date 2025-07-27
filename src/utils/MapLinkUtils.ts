import { ProjectData, State } from '@src/GlobalStateProvider';

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);

export const checkValidMaplink = (mapId: number, state: State) => {
  const validMaps = getValidMaps(state.projectData.zones);
  const mapsFiltered = Object.values(state.projectData.maps).filter(({ id }) => validMaps.includes(id));
  return mapsFiltered.find((map) => map.id === mapId) ? true : false;
};
