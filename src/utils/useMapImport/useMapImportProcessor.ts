import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MapImportFunctionBinding, MapImportStateObject, MapToImport } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { PartialStudioMap } from 'ts-tiled-converter';
import { fail, toAsyncProcess } from './helpers';
import { useProjectMaps } from '@utils/useProjectData';
import { useMapInfo } from '@utils/useMapInfo';
import { createMap, createMapInfo } from '@utils/entityCreation';
import { StudioMapInfoMap } from '@modelEntities/mapInfo';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Sha1 } from '@modelEntities/sha1';
import { addNewMapInfo } from '@utils/MapInfoUtils';
import { padStr } from '@utils/PadStr';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { RMXPMap } from '@src/backendTasks/readRMXPMap';

const DEFAULT_BINDING: MapImportFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useMapImportProcessor = () => {
  const [globalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { mapInfo, setMapInfo } = useMapInfo();
  const setText = useSetProjectText();
  const { t } = useTranslation('database_maps');
  const binding = useRef<MapImportFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapImportStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      import: ({ filesToImport, tiledFilesSrcPath }, setState) => {
        loaderRef.current.open('importing_tiled_maps', 1, 4, t('reading_data_tiled_files'));
        const tiledMetadata: PartialStudioMap[] = [];

        const importTmxFiles = (files: MapImportFiles[], tiledMetadata: PartialStudioMap[], index = 0) => {
          if (index >= files.length) {
            if (files.some((file) => file.error)) {
              setState(DEFAULT_PROCESS_STATE);
              fail(
                binding,
                files.map((file) => ({ path: file.path, errorMessage: file.error }))
              );
            } else {
              const mapsToImport = files.map((file, index) => ({
                path: file.path,
                mapName: file.mapName,
                mapId: file.mapId,
                mtime: 0,
                ...tiledMetadata[index],
              }));
              setState({ state: 'copyTmxFiles', mapsToImport, tiledFilesSrcPath });
            }
            return () => {};
          }

          const file = files[index];
          return window.api.convertTiledMapToTileMetadata(
            { tmxPath: file.path },
            (payload) => {
              tiledMetadata.push(payload);
              importTmxFiles(files, tiledMetadata, ++index);
            },
            ({ errorMessage }) => {
              file.error = errorMessage;
              importTmxFiles(files, tiledMetadata, ++index);
            }
          );
        };

        return importTmxFiles(filesToImport, tiledMetadata);
      },
      copyTmxFiles: ({ mapsToImport, tiledFilesSrcPath }, setState) => {
        loaderRef.current.setProgress(2, 4, t('copy_tiled_files'));
        return window.api.copyTiledFiles(
          { projectPath: globalState.projectPath!, tiledMaps: JSON.stringify(mapsToImport), tiledSrcPath: tiledFilesSrcPath },
          ({ tiledMaps }) => {
            const mapsToImport: MapToImport[] = JSON.parse(tiledMaps);
            // the news maps must be create after the maps with a map id defined
            mapsToImport.sort((a, b) => {
              return (a.mapId || 999_999) - (b.mapId || 999_999);
            });
            setState({ state: 'getRMXPMapsData', mapsToImport });
          },
          ({ errorMessage }) => {
            setState(DEFAULT_PROCESS_STATE);
            fail(binding, mapsToImport, errorMessage);
          }
        );
      },
      getRMXPMapsData: ({ mapsToImport }, setState) => {
        loaderRef.current.setProgress(3, 4, t('read_data_rmxp_maps'));
        const rmxpMaps: (RMXPMap | undefined)[] = [];

        const readRMXPMap = (mapsToImport: MapToImport[], rmxpMaps: (RMXPMap | undefined)[], index = 0) => {
          if (index >= mapsToImport.length) {
            const mapsToImportWithRMXPMap = mapsToImport.map((mapToImport, index) => ({ ...mapToImport, rmxpMap: rmxpMaps[index] }));
            setState({ state: 'createNewMaps', mapsToImportWithRMXPMap });
            return () => {};
          }

          const mapToImport = mapsToImport[index];
          const mapId = mapToImport.mapId;
          if (mapId === undefined) {
            rmxpMaps.push(undefined);
            readRMXPMap(mapsToImport, rmxpMaps, ++index);
            return () => {};
          }

          return window.api.readRMXPMap(
            { projectPath: globalState.projectPath!, mapId },
            (payload) => {
              rmxpMaps.push(payload.rmxpMapData);
              readRMXPMap(mapsToImport, rmxpMaps, ++index);
            },
            ({ errorMessage }) => {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, mapsToImport, errorMessage);
            }
          );
        };

        return readRMXPMap(mapsToImport, rmxpMaps);
      },
      createNewMaps: ({ mapsToImportWithRMXPMap }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(4, 4, t('create_new_maps'));
          if (mapsToImportWithRMXPMap.length === 0) {
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          const mapToImport = mapsToImportWithRMXPMap[0];
          const rmxpMap = mapToImport.rmxpMap;
          const newMap = createMap(maps, 30, mapToImport.path, '', '');
          if (mapToImport.mapId !== undefined) {
            newMap.id = mapToImport.mapId;
            newMap.dbSymbol = `map${padStr(newMap.id, 3)}` as DbSymbol;
          }
          newMap.mtime = mapToImport.mtime;
          newMap.sha1 = mapToImport.sha1 as Sha1;
          newMap.tileMetadata = mapToImport.tileMetadata;
          if (rmxpMap) {
            newMap.bgm = rmxpMap.bgm.name;
            newMap.bgs = rmxpMap.bgs.name;
            newMap.stepsAverage = rmxpMap.encounterStep;
          }
          const dbSymbol = newMap.dbSymbol;
          const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: 0 }) as StudioMapInfoMap;
          const newMapInfo = addNewMapInfo(mapInfo, newMapInfoMap);
          setText(MAP_NAME_TEXT_ID, newMap.id, mapToImport.mapName);
          setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, '');
          setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
          setMapInfo(newMapInfo);
          mapsToImportWithRMXPMap.shift();
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps]
  );

  return { processors, binding };
};
