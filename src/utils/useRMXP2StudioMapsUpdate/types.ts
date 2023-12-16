import { StudioMap } from '@modelEntities/map';
import { StudioMapInfo } from '@modelEntities/mapInfo';
import { ProjectText } from '@src/GlobalStateProvider';

export type RMXP2StudioMapsUpdateFailureCallback = (error: { errorMessage: string }) => void;
export type RMXP2StudioMapsUpdateSuccessCallback = (payload: Record<string, never>) => void;
export type RMXP2StudioMapsUpdateStateObject =
  | { state: 'done' }
  | { state: 'synchronise' }
  | { state: 'readMaps' }
  | { state: 'updateMap'; maps: StudioMap[]; mapInfo: StudioMapInfo; mapNames: string[][]; mapDescriptions: string[][] };
export type RMXP2StudioMapsUpdateFunctionBinding = {
  onSuccess: RMXP2StudioMapsUpdateSuccessCallback;
  onFailure: RMXP2StudioMapsUpdateFailureCallback;
};
