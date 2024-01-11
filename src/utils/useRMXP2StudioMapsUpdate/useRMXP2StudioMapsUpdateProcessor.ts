import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { RMXP2StudioMapsUpdateFunctionBinding, RMXP2StudioMapsUpdateStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { getSelectedMap, handleFailure, toAsyncProcess } from './helpers';
import { useGlobalState } from '@src/GlobalStateProvider';
import { deserializeZodData, zodDataToEntries } from '@utils/SerializationUtils';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID, MAP_VALIDATOR } from '@modelEntities/map';
import { MAP_INFO_VALIDATOR } from '@modelEntities/mapInfo';
import { DbSymbol } from '@modelEntities/dbSymbol';

const DEFAULT_BINDING: RMXP2StudioMapsUpdateFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useRMXP2StudioMapsUpdateProcessor = () => {
  const [globalState, setGlobalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { t } = useTranslation('database_maps');
  const binding = useRef<RMXP2StudioMapsUpdateFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<RMXP2StudioMapsUpdateStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      synchronise: (_, setState) => {
        loaderRef.current.open('updating_maps', 1, 3, t('update_rmxp_maps'));
        return window.api.RMXP2StudioMapsSync(
          { projectPath: globalState.projectPath! },
          () => setState({ state: 'readMaps' }),
          handleFailure(setState, binding)
        );
      },
      readMaps: (_, setState) => {
        loaderRef.current.setProgress(2, 3, t('read_data_rmxp_maps'));
        return window.api.readMaps(
          { projectPath: globalState.projectPath! },
          ({ maps, mapInfo, mapNames, mapDescriptions }) => {
            const mapsResult = deserializeZodData(maps, MAP_VALIDATOR);
            const mapInfoResult = MAP_INFO_VALIDATOR.safeParse(JSON.parse(mapInfo));
            if (mapsResult.integrityFailureCount.count === 0 && mapInfoResult.success) {
              setState({ state: 'updateMap', maps: mapsResult.input, mapInfo: mapInfoResult.data, mapNames, mapDescriptions });
            } else {
              const errorMessage: string[] = [];
              if (!mapInfoResult.success) errorMessage.push('Failed to parse the map_info.json file', mapInfoResult.error.message);
              if (mapsResult.integrityFailureCount.count !== 0) {
                errorMessage.push(`Failed to load ${mapsResult.integrityFailureCount.count} map(s)`);
              }
              handleFailure(setState, binding)({ errorMessage });
            }
          },
          handleFailure(setState, binding)
        );
      },
      updateMap: ({ maps, mapInfo, mapNames, mapDescriptions }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(3, 3, t('update_maps'));
          const projectDataMaps = zodDataToEntries(maps);
          const selectedMap = getSelectedMap(projectDataMaps, globalState.selectedDataIdentifier.map as DbSymbol);
          setGlobalState((state) => ({
            ...state,
            projectData: {
              ...state.projectData,
              maps: projectDataMaps,
            },
            projectText: {
              ...state.projectText,
              [MAP_NAME_TEXT_ID]: mapNames,
              [MAP_DESCRIPTION_TEXT_ID]: mapDescriptions,
            },
            selectedDataIdentifier: {
              ...state.selectedDataIdentifier,
              map: selectedMap,
            },
            mapInfo,
          }));
          binding.current.onSuccess({});
          return setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalState]
  );

  return { processors, binding };
};
