import { ProjectData } from '@src/GlobalStateProvider';

export const getValidMaps = (zones: ProjectData['zones']) =>
  Object.values(zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);
