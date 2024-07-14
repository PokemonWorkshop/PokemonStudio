import { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import { useMapImport } from '../useMapImport';
import { basename, dirname, join } from '@utils/path';
import { useMemo, useRef } from 'react';
import { MapCopyFunctionBinding, MapCopyStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { toAsyncProcess } from '@hooks/Helper';
import { useGlobalState } from '@src/GlobalStateProvider';

const DEFAULT_BINDING: MapCopyFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
  onGenericFailure: () => {},
};

export const useMapCopyProcessor = () => {
  const [state] = useGlobalState();
  const mapImport = useMapImport();
  const binding = useRef<MapCopyFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<MapCopyStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      copy: ({ tmxFile }, setState) => {
        const filesToImport: MapImportFiles[] = [{ filename: tmxFile, mapName: '', path: tmxFile, shouldBeImport: true }];
        return toAsyncProcess(() => {
          // If the tmx file is in Data/Tiled/Map folder of the project, we don't do copy
          if (tmxFile.replaceAll('\\', '/').startsWith(join(state.projectPath?.replaceAll('\\', '/') || '', 'Data/Tiled/Maps'))) {
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          return mapImport(
            { filesToImport: filesToImport, tiledFilesSrcPath: dirname(tmxFile), rmxpMapInfo: [], copyMode: true },
            () => {
              binding.current.onSuccess({});
              return setState(DEFAULT_PROCESS_STATE);
            },
            (error, genericError) => {
              const errorMessage = error[0]?.errorMessage;
              if (errorMessage) {
                binding.current.onFailure(`${basename(tmxFile)}: ${errorMessage}`);
                return setState(DEFAULT_PROCESS_STATE);
              }
              if (genericError) {
                binding.current.onGenericFailure(genericError);
                return setState(DEFAULT_PROCESS_STATE);
              }
              binding.current.onGenericFailure('Unknown error');
              return setState(DEFAULT_PROCESS_STATE);
            }
          );
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { processors, binding };
};
