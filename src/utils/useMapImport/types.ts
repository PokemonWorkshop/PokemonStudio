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
  | { state: 'import'; filesToImport: MapImportFiles[]; tiledFilesSrcPath: string; rmxpMapIds: number[] }
  | { state: 'copyTmxFiles'; mapsToImport: MapToImport[]; tiledFilesSrcPath: string; rmxpMapIds: number[] }
  | { state: 'getRMXPMapsData'; mapsToImport: MapToImport[]; rmxpMapIds: number[] }
  | { state: 'createNewMaps'; mapsToImportWithRMXPMap: MapToImportWithRMXPMap[]; rmxpMapIds: number[] };
export type MapImportFunctionBinding = {
  onSuccess: MapImportSuccessCallback;
  onFailure: MapImportFailureCallback;
};
