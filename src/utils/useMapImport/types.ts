import type { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { RMXPMap } from '@src/backendTasks/readRMXPMap';
import type { PartialStudioMap } from 'ts-tiled-converter';

export type MapToImport = { mtime: number } & Omit<MapImportFiles, 'shouldBeImport' | 'error' | 'filename'> & PartialStudioMap;
export type MapToImportWithRMXPMap = { rmxpMap?: RMXPMap } & MapToImport;
export type MapImportError = { path: string; errorMessage?: string };

export type MapImportFailureCallback = (error: MapImportError[], genericError?: string) => void;
export type MapImportSuccessCallback = (payload: Record<string, never>) => void;
export type MapImportStateObject =
  | { state: 'done' }
  | { state: 'import'; filesToImport: MapImportFiles[]; tiledFilesSrcPath: string }
  | { state: 'copyTmxFiles'; mapsToImport: MapToImport[]; tiledFilesSrcPath: string }
  | { state: 'getRMXPMapsData'; mapsToImport: MapToImport[] }
  | { state: 'createNewMaps'; mapsToImportWithRMXPMap: MapToImportWithRMXPMap[] };
export type MapImportFunctionBinding = {
  onSuccess: MapImportSuccessCallback;
  onFailure: MapImportFailureCallback;
};
