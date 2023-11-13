import { useGlobalState } from '@src/GlobalStateProvider';
import { StudioMapInfo } from '@modelEntities/mapInfo';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate map info data from a specific screen.
 * @example
 * const {
 *  mapInfoValues: mapInfo,
 *  setMapInfoValues: setMapInfo,
 * } = useMapInfo();
 */
export const useMapInfo = () => {
  const [state, setState] = useGlobalState();
  const mapInfo = state.mapInfo;

  const setMapInfo = (newMapInfo: StudioMapInfo) => {
    if (JSON.stringify(newMapInfo) !== JSON.stringify(mapInfo)) {
      setState((currentState) => ({
        ...currentState,
        mapInfo: newMapInfo,
        savingMapInfo: true,
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        mapInfo: newMapInfo,
      }));
    }
  };

  return {
    mapInfo,
    setMapInfo,
    state,
  };
};

/**
 * Captain Hook of the Hooks. This hook allow you to read map info data from a specific screen.
 * @example
 * const {
 *  mapInfoValues: mapInfo,
 *  state, // For specific use like text
 * } = useMapInfoReadonly;
 */
export const useMapInfoReadonly = () => {
  const [state] = useGlobalState();

  return {
    mapInfo: state.mapInfo,
    state,
  };
};

export type UseMapInfoReturnType = ReturnType<typeof useMapInfo>;
