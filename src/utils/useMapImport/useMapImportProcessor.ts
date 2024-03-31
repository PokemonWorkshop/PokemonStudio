import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MapImportFunctionBinding, MapImportStateObject, MapToImport } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { PartialStudioMap } from 'ts-tiled-converter';
import { fail, toAsyncProcess } from './helpers';
import { useProjectMapLinks, useProjectMaps } from '@utils/useProjectData';
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
import { getValidMaps } from '@utils/MapLinkUtils';

const DEFAULT_BINDING: MapImportFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useMapImportProcessor = () => {
  const [globalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { mapInfo, setMapInfo } = useMapInfo();
  const { projectDataValues: mapLinks, selectedDataIdentifier: currentMapLink, setSelectedDataIdentifier: setSelectedMapLink } = useProjectMapLinks();
  const setText = useSetProjectText();
  const { t } = useTranslation('database_maps');
  const binding = useRef<MapImportFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapImportStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      import: ({ filesToImport, tiledFilesSrcPath, rmxpMapInfo, copyMode }, setState) => {
        loaderRef.current.open('importing_tiled_maps', 1, 5, t('reading_data_tiled_files'));
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
                mtime: 1,
                ...tiledMetadata[index],
              }));
              setState({ state: 'copyTmxFiles', mapsToImport, tiledFilesSrcPath, rmxpMapInfo, copyMode });
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
      copyTmxFiles: ({ mapsToImport, tiledFilesSrcPath, rmxpMapInfo, copyMode }, setState) => {
        loaderRef.current.setProgress(2, 5, t('copy_tiled_files'));
        return window.api.copyTiledFiles(
          { projectPath: globalState.projectPath!, tiledMaps: JSON.stringify(mapsToImport), tiledSrcPath: tiledFilesSrcPath },
          ({ tiledMaps }) => {
            if (copyMode) {
              binding.current.onSuccess({});
              setState(DEFAULT_PROCESS_STATE);
            } else {
              const mapsToImport: MapToImport[] = JSON.parse(tiledMaps);
              setState({ state: 'addMissingRMXPMaps', mapsToImport, rmxpMapInfo });
            }
          },
          ({ errorMessage }) => {
            setState(DEFAULT_PROCESS_STATE);
            fail(binding, mapsToImport, errorMessage);
          }
        );
      },
      addMissingRMXPMaps: ({ mapsToImport, rmxpMapInfo }, setState) => {
        loaderRef.current.setProgress(3, 5, t('add_missing_rmxp_maps'));
        const studioMaps = Object.values(maps);
        return toAsyncProcess(() => {
          rmxpMapInfo.forEach(({ id: rmxpMapId, name }) => {
            if (mapsToImport.find(({ mapId }) => mapId === rmxpMapId) || studioMaps.find(({ id }) => id === rmxpMapId)) return;

            mapsToImport.push({ mapName: name, mtime: 1, sha1: '', path: '', tileMetadata: undefined, mapId: rmxpMapId });
          });
          // the news maps must be create after the maps with a map id defined
          mapsToImport.sort((a, b) => {
            return (a.mapId || 999_999) - (b.mapId || 999_999);
          });
          setState({ state: 'getRMXPMapsData', mapsToImport, rmxpMapIds: rmxpMapInfo.map(({ id }) => id) });
        });
      },
      getRMXPMapsData: ({ mapsToImport, rmxpMapIds }, setState) => {
        loaderRef.current.setProgress(4, 5, t('read_data_rmxp_maps'));
        const rmxpMaps: Record<number, RMXPMap> = {};

        const readRMXPMap = (index = 0) => {
          if (index >= rmxpMapIds.length) {
            setState({ state: 'createNewMaps', mapsToImport, rmxpMaps, rmxpMapIds });
            return () => {};
          }

          const mapId = rmxpMapIds[index];
          return window.api.readRMXPMap(
            { projectPath: globalState.projectPath!, mapId },
            (payload) => {
              rmxpMaps[mapId] = payload.rmxpMapData;
              readRMXPMap(++index);
            },
            ({ errorMessage }) => {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, mapsToImport, errorMessage);
            }
          );
        };

        return readRMXPMap();
      },
      createNewMaps: ({ mapsToImport, rmxpMaps, rmxpMapIds }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(5, 5, t('create_new_maps'));
          if (mapsToImport.length === 0) {
            // update the selected maplink by default
            const mapLinkValues = Object.values(mapLinks);
            if (mapLinkValues.length > 0 && currentMapLink === '__undef__') {
              const validMaps = getValidMaps(globalState.projectData.zones);
              const mapLinkFiltered = mapLinkValues.filter((mapLink) => validMaps.includes(mapLink.mapId));
              if (mapLinkFiltered.length > 0) setSelectedMapLink({ mapLink: mapLinkFiltered[0].mapId.toString() });
            }
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          const mapToImport = mapsToImport[0];
          const rmxpMap = mapToImport.mapId !== undefined ? rmxpMaps[mapToImport.mapId] : undefined;
          const newMap = createMap(
            maps,
            30,
            mapToImport.path,
            { name: '', volume: 100, pitch: 100 },
            { name: '', volume: 100, pitch: 100 },
            rmxpMapIds
          );
          if (mapToImport.mapId !== undefined) {
            newMap.id = mapToImport.mapId;
            newMap.dbSymbol = `map${padStr(newMap.id, 3)}` as DbSymbol;
          }
          newMap.mtime = mapToImport.mtime;
          newMap.sha1 = mapToImport.sha1 as Sha1;
          newMap.tileMetadata = mapToImport.tileMetadata;
          if (rmxpMap) {
            newMap.bgm = rmxpMap.bgm;
            newMap.bgs = rmxpMap.bgs;
            newMap.stepsAverage = rmxpMap.encounterStep;
          }
          const dbSymbol = newMap.dbSymbol;
          const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: 0 }) as StudioMapInfoMap;
          const newMapInfo = addNewMapInfo(mapInfo, newMapInfoMap);
          setText(MAP_NAME_TEXT_ID, newMap.id, mapToImport.mapName);
          setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, '');
          setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
          setMapInfo(newMapInfo);
          mapsToImport.shift();
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps]
  );

  return { processors, binding };
};
