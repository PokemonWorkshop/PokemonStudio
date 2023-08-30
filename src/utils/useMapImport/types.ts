import { MapImportFiles } from '@components/world/map/editors/MapImport/MapImportType';
import { PartialStudioMap } from 'ts-tiled-converter';

export type MapToImport = { mtime: number } & Omit<MapImportFiles, 'shouldBeImport' | 'error' | 'filename'> & PartialStudioMap;
export type MapImportError = { path: string; errorMessage?: string };

export type MapImportFailureCallback = (error: MapImportError[], genericError?: string) => void;
export type MapImportSuccessCallback = (payload: Record<string, never>) => void;
export type MapImportStateObject =
  | { state: 'done' }
  | { state: 'import'; filesToImport: MapImportFiles[]; tiledFilesSrcPath: string }
  | { state: 'copyTmxFiles'; mapsToImport: MapToImport[]; tiledFilesSrcPath: string }
  | { state: 'createNewMap'; mapsToImport: MapToImport[] };
export type MapImportFunctionBinding = {
  onSuccess: MapImportSuccessCallback;
  onFailure: MapImportFailureCallback;
};
