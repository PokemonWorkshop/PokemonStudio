import type { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import type { PartialStudioMap } from 'ts-tiled-converter';

export type MapToImport = { mtime: number; sha1: string; tileMetadata?: PartialStudioMap['tileMetadata'] } & Omit<
  MapImportFiles,
  'shouldBeImport' | 'error' | 'filename'
>;
export type MapImportError = { path: string; errorMessage?: string };

export type MapImportFailureCallback = (error: MapImportError[], genericError?: string) => void;
export type MapImportSuccessCallback = (payload: Record<string, never>) => void;
export type MapImportStateObject =
  | { state: 'done' }
  | { state: 'import'; filesToImport: MapImportFiles[]; tiledFilesSrcPath: string; copyMode: boolean }
  | { state: 'copyTmxFiles'; mapsToImport: MapToImport[]; tiledFilesSrcPath: string; copyMode: boolean }
  | { state: 'generatingOverviews'; mapsToImport: MapToImport[] }
  | { state: 'createOrUpdateMaps'; mapsToImport: MapToImport[] };
export type MapImportFunctionBinding = {
  onSuccess: MapImportSuccessCallback;
  onFailure: MapImportFailureCallback;
};
