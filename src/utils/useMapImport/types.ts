import type { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { RMXPMap } from '@src/backendTasks/readRMXPMap';
import type { PartialStudioMap } from 'ts-tiled-converter';

export type RMXPMapInfo = { id: number; name: string };
export type MapToImport = { mtime: number; sha1: string; tileMetadata?: PartialStudioMap['tileMetadata'] } & Omit<
  MapImportFiles,
  'shouldBeImport' | 'error' | 'filename'
>;
export type MapToImportWithRMXPMap = { rmxpMap?: RMXPMap } & MapToImport;
export type MapImportError = { path: string; errorMessage?: string };

export type MapImportFailureCallback = (error: MapImportError[], genericError?: string) => void;
export type MapImportSuccessCallback = (payload: Record<string, never>) => void;
export type MapImportStateObject =
  | { state: 'done' }
  | { state: 'import'; filesToImport: MapImportFiles[]; tiledFilesSrcPath: string; rmxpMapInfo: RMXPMapInfo[] }
  | { state: 'copyTmxFiles'; mapsToImport: MapToImport[]; tiledFilesSrcPath: string; rmxpMapInfo: RMXPMapInfo[] }
  | { state: 'addMissingRMXPMaps'; mapsToImport: MapToImport[]; rmxpMapInfo: RMXPMapInfo[] }
  | { state: 'getRMXPMapsData'; mapsToImport: MapToImport[]; rmxpMapIds: number[] }
  | { state: 'createNewMaps'; mapsToImport: MapToImport[]; rmxpMaps: Record<number, RMXPMap>; rmxpMapIds: number[] };
export type MapImportFunctionBinding = {
  onSuccess: MapImportSuccessCallback;
  onFailure: MapImportFailureCallback;
};
