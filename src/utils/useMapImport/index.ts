import type { MapImportFailureCallback, MapImportSuccessCallback, RMXPMapInfo } from './types';
import { DEFAULT_PROCESS_STATE, useProcess } from '@utils/useProcess';
import { useMapImportProcessor } from './useMapImportProcessor';
import type { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';

export const useMapImport = () => {
  const { processors, binding } = useMapImportProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { filesToImport: MapImportFiles[]; tiledFilesSrcPath: string; rmxpMapInfo: RMXPMapInfo[] },
    onSuccess: MapImportSuccessCallback,
    onFailure: MapImportFailureCallback
  ) => {
    binding.current = { onFailure, onSuccess };
    setState({
      state: 'import',
      filesToImport: payload.filesToImport,
      tiledFilesSrcPath: payload.tiledFilesSrcPath,
      rmxpMapInfo: payload.rmxpMapInfo,
    });
  };
};
