import type { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import { DEFAULT_PROCESS_STATE, useProcess } from '@hooks/useProcess';
import type { MapImportFailureCallback, MapImportSuccessCallback, RMXPMapInfo } from './types';
import { useMapImportProcessor } from './useMapImportProcessor';

export const useMapImport = () => {
  const { processors, binding } = useMapImportProcessor();
  const setState = useProcess(processors, DEFAULT_PROCESS_STATE);

  return (
    payload: { filesToImport: MapImportFiles[]; tiledFilesSrcPath: string; rmxpMapInfo: RMXPMapInfo[]; copyMode?: boolean },
    onSuccess: MapImportSuccessCallback,
    onFailure: MapImportFailureCallback,
  ) => {
    binding.current = { onFailure, onSuccess };
    setState({
      state: 'import',
      filesToImport: payload.filesToImport,
      tiledFilesSrcPath: payload.tiledFilesSrcPath,
      rmxpMapInfo: payload.rmxpMapInfo,
      copyMode: payload.copyMode || false,
    });
  };
};
