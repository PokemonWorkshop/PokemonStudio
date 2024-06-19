import { DbSymbol } from '@modelEntities/dbSymbol';
import { PartialStudioMap } from 'ts-tiled-converter';

export type MapUpdateFiles = { dbSymbol: DbSymbol; filename: string; error?: string };
export type MapToUpdate = { dbSymbol: DbSymbol; mtime: number } & PartialStudioMap;
export type MapUpdateError = { filename: string; errorMessage?: string };

export type MapUpdateFailureCallback = (error: MapUpdateError[], genericError?: string) => void;
export type MapUpdateSuccessCallback = (payload: Record<string, never>) => void;
export type MapUpdateStateObject =
  | { state: 'done' }
  | { state: 'convert' }
  | { state: 'generatingOverviews'; mapsToUpdate: MapToUpdate[] }
  | { state: 'updateMap'; mapsToUpdate: MapToUpdate[] };
export type MapUpdateFunctionBinding = {
  onSuccess: MapUpdateSuccessCallback;
  onFailure: MapUpdateFailureCallback;
};
