import { toAsyncProcess } from '@hooks/Helper';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { useProjectMaps } from '@hooks/useProjectData';
import { Sha1 } from '@modelEntities/sha1';
import type { ConvertTMXOutput } from '@src/backendTasks/convertTiledMapToTileMetadata';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useLoaderRef } from '@utils/loaderContext';
import { join } from '@utils/path';
import { getSetting } from '@utils/settings';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fail, getTmxList } from './helpers';
import type { MapUpdateFiles, MapUpdateFunctionBinding, MapUpdateStateObject } from './types';

const DEFAULT_BINDING: MapUpdateFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

export const useMapUpdateProcessor = () => {
  const [globalState, setGlobalState] = useGlobalState();
  const loaderRef = useLoaderRef();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { t } = useTranslation();
  const binding = useRef<MapUpdateFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapUpdateStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      convert: ({ type, subsetDbSymbols }, setState) => {
        loaderRef.current.open('updating_maps', 1, 3, t('reading_data_tiled_files'));
        const tmxFiles = getTmxList(maps, globalState.mapsModified, type, subsetDbSymbols);
        const tiledMetadata: ConvertTMXOutput[] = [];
        const filesLength = tmxFiles.length;

        const convertTmxFiles = (files: MapUpdateFiles[], tiledMetadata: ConvertTMXOutput[], index = 0) => {
          if (index >= filesLength) {
            if (files.some((file) => file.error)) {
              setState(DEFAULT_PROCESS_STATE);
              fail(
                binding,
                files.map((file) => ({ filename: file.filename, errorMessage: file.error })),
              );
            } else {
              const mapsToUpdate = files.map((file, index) => ({ dbSymbol: file.dbSymbol, ...tiledMetadata[index] }));
              setState({ state: 'generatingOverviews', mapsToUpdate });
            }
            return () => {};
          }

          const file = files[index];
          const path = join(globalState.projectPath!, 'Data/Tiled/Maps', `${file.filename}.tmx`);
          if (loaderRef.current.isOpen) {
            loaderRef.current.setProgress(1, 3, `${t('reading_data_tiled_files')} (${index + 1}/${filesLength})`);
          } else {
            loaderRef.current.open('updating_maps', 1, 3, `${t('reading_data_tiled_files')} (${index + 1}/${filesLength})`);
          }
          return window.api.convertTiledMapToTileMetadata(
            { tmxPath: path },
            (payload) => {
              tiledMetadata.push(payload);
              convertTmxFiles(files, tiledMetadata, ++index);
            },
            ({ errorMessage }) => {
              file.error = errorMessage;
              convertTmxFiles(files, tiledMetadata, ++index);
            },
          );
        };

        return convertTmxFiles(tmxFiles, tiledMetadata);
      },
      generatingOverviews: ({ mapsToUpdate }, setState) => {
        loaderRef.current.setProgress(2, 3, t('map_overviews_generating'));
        const mapsLength = mapsToUpdate.length;
        const generatingMapOverview = (index = 0): (() => void) => {
          if (index >= mapsLength) {
            setState({ state: 'updateMap', mapsToUpdate });
            return () => {};
          }
          const map = maps[mapsToUpdate[index].dbSymbol];
          loaderRef.current.setProgress(2, 3, `${t('map_overviews_generating')} (${index + 1}/${mapsLength})`);
          return window.api.generatingMapOverview(
            { projectPath: globalState.projectPath!, tiledFilename: map.tiledFilename, tiledExecPath: getSetting('tiledPath') },
            () => generatingMapOverview(++index),
            ({ errorMessage }) => {
              setState(DEFAULT_PROCESS_STATE);
              fail(binding, [{ filename: map.tiledFilename, errorMessage }]);
            },
          );
        };
        return generatingMapOverview();
      },
      updateMap: ({ mapsToUpdate }, setState) => {
        return toAsyncProcess(() => {
          loaderRef.current.setProgress(3, 3, t('update_maps'));
          mapsToUpdate.forEach((mapToUpdate) => {
            const mapUpdate = { ...maps[mapToUpdate.dbSymbol], ...mapToUpdate, sha1: mapToUpdate.sha1 as Sha1 };
            // No selection argument on purpose: setMap preserves the current
            // selection when none is passed. Passing one read from `globalState`
            // captured in this memo (deps: [maps]) forced the user back to
            // whatever map was selected when the memo was last built — which is
            // stale as soon as they navigate without map data changing.
            setMap({ [mapUpdate.dbSymbol]: mapUpdate });
          });
          // Remove only the maps we actually updated from the modified list.
          // For full / auto_detection this still ends up clearing the list
          // (since we processed every modified map), but for single-map
          // updates from the per-row dot we leave the rest flagged.
          const updatedSymbols = new Set(mapsToUpdate.map((m) => m.dbSymbol));
          setGlobalState((state) => ({
            ...state,
            mapsModified: state.mapsModified.filter((s) => !updatedSymbols.has(s)),
          }));
          binding.current.onSuccess({});
          return setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps],
  );

  return { processors, binding };
};
