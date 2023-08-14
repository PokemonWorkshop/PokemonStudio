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
  const mapInfoValues = state.mapInfo;

  const setMapInfoValues = (newMapInfoValues: StudioMapInfo[]) => {
    if (JSON.stringify(newMapInfoValues) !== JSON.stringify(mapInfoValues)) {
      setState((currentState) => ({
        ...currentState,
        mapInfo: newMapInfoValues,
        savingMapInfo: true,
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        mapInfo: newMapInfoValues,
      }));
    }
  };

  return {
    mapInfoValues,
    setMapInfoValues,
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
    mapInfoValues: state.mapInfo,
    state,
  };
};

export type UseMapInfoReturnType = ReturnType<typeof useMapInfo>;
