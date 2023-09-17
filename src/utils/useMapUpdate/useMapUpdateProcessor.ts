import { useLoaderRef } from '@utils/loaderContext';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MapUpdateFiles, MapUpdateFunctionBinding, MapUpdateStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { fail, toAsyncProcess } from './helpers';
import { useProjectMaps } from '@utils/useProjectData';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Sha1 } from '@modelEntities/sha1';
import { join } from '@utils/path';
import type { ConvertTMXOutput } from '@src/backendTasks/convertTiledMapToTileMetadata';

const DEFAULT_BINDING: MapUpdateFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useMapUpdateProcessor = () => {
  const [globalState, setGlobalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { t } = useTranslation('database_maps');
  const binding = useRef<MapUpdateFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapUpdateStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      convert: (_, setState) => {
        loaderRef.current.open('updating_maps', 1, 2, t('reading_data_tiled_files'));
        const tmxFiles: MapUpdateFiles[] = Object.values(maps)
          .filter((map) => globalState.mapsModified.includes(map.dbSymbol))
          .map(({ dbSymbol, tiledFilename }) => ({ dbSymbol, filename: tiledFilename }));
        const tiledMetadata: ConvertTMXOutput[] = [];

        const convertTmxFiles = (files: MapUpdateFiles[], tiledMetadata: ConvertTMXOutput[], index = 0) => {
          if (index >= files.length) {
            if (files.some((file) => file.error)) {
              setState(DEFAULT_PROCESS_STATE);
              fail(
                binding,
                files.map((file) => ({ filename: file.filename, errorMessage: file.error }))
              );
            } else {
              const mapsToUpdate = files.map((file, index) => ({ dbSymbol: file.dbSymbol, ...tiledMetadata[index] }));
              setState({ state: 'updateMap', mapsToUpdate });
            }
            return () => {};
          }

          const file = files[index];
          const path = join(globalState.projectPath!, 'Data/Tiled/Maps', `${file.filename}.tmx`);
          return window.api.convertTiledMapToTileMetadata(
            { tmxPath: path },
            (payload) => {
              tiledMetadata.push(payload);
              convertTmxFiles(files, tiledMetadata, ++index);
            },
            ({ errorMessage }) => {
              file.error = errorMessage;
              convertTmxFiles(files, tiledMetadata, ++index);
            }
          );
        };

        return convertTmxFiles(tmxFiles, tiledMetadata);
      },
      updateMap: ({ mapsToUpdate }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(2, 2, t('update_maps'));
          const selectedMap = globalState.selectedDataIdentifier.map;
          mapsToUpdate.forEach((mapToUpdate) => {
            const mapUpdate = { ...maps[mapToUpdate.dbSymbol], ...mapToUpdate, sha1: mapToUpdate.sha1 as Sha1 };
            setMap({ [mapUpdate.dbSymbol]: mapUpdate }, { map: selectedMap });
          });
          setGlobalState((state) => ({ ...state, mapsModified: [] }));
          binding.current.onSuccess({});
          return setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps]
  );

  return { processors, binding };
};
