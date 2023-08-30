import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MapImportFunctionBinding, MapImportStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { PartialStudioMap } from 'ts-tiled-converter';
import { fail, toAsyncProcess } from './helpers';
import { useProjectMaps } from '@utils/useProjectData';
import { useMapInfo } from '@utils/useMapInfo';
import { createMap, createMapInfo } from '@utils/entityCreation';
import { StudioMapInfoMap } from '@modelEntities/mapInfo';
import { cloneEntity } from '@utils/cloneEntity';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Sha1 } from '@modelEntities/sha1';

const DEFAULT_BINDING: MapImportFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useMapImportProcessor = () => {
  const [globalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { mapInfoValues: mapInfoValues, setMapInfoValues: setMapInfo } = useMapInfo();
  const setText = useSetProjectText();
  const { t } = useTranslation('database_maps');
  const binding = useRef<MapImportFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapImportStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      import: ({ filesToImport, tiledFilesSrcPath }, setState) => {
        loaderRef.current.open('importing_tiled_maps', 1, 3, t('reading_data_tiled_files'));
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
              const mapsToImport = files.map((file, index) => ({ path: file.path, mapName: file.mapName, mtime: 0, ...tiledMetadata[index] }));
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
        loaderRef.current.setProgress(2, 3, t('copy_tiled_files'));
        return window.api.copyTiledFiles(
          { projectPath: globalState.projectPath!, tiledMaps: JSON.stringify(mapsToImport), tiledSrcPath: tiledFilesSrcPath },
          ({ tiledMaps }) => {
            setState({ state: 'createNewMap', mapsToImport: JSON.parse(tiledMaps) });
          },
          ({ errorMessage }) => {
            setState(DEFAULT_PROCESS_STATE);
            fail(binding, mapsToImport, errorMessage);
          }
        );
      },
      createNewMap: ({ mapsToImport }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(3, 3, t('create_new_maps'));
          if (mapsToImport.length === 0) {
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          const mapInfoCloned = cloneEntity(mapInfoValues);
          const mapToImport = mapsToImport[0];
          const newMap = createMap(maps, 30, mapToImport.path, '', '');
          newMap.mtime = mapToImport.mtime;
          newMap.sha1 = mapToImport.sha1 as Sha1;
          newMap.tileMetadata = mapToImport.tileMetadata;
          const dbSymbol = newMap.dbSymbol;
          const newMapInfoMap = createMapInfo(mapInfoValues, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol }) as StudioMapInfoMap;
          mapInfoCloned.push(newMapInfoMap);
          setText(MAP_NAME_TEXT_ID, newMap.id, mapToImport.mapName);
          setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, '');
          setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
          setMapInfo(mapInfoCloned);
          mapsToImport.shift();
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps]
  );

  return { processors, binding };
};
