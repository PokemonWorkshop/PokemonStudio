import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { RMXP2StudioMapsUpdateFunctionBinding, RMXP2StudioMapsUpdateStateObject } from './types';
import { ProjectData } from '@src/GlobalStateProvider';
import { DbSymbol } from '@modelEntities/dbSymbol';

export const fail = (binding: MutableRefObject<RMXP2StudioMapsUpdateFunctionBinding>, error: unknown) => {
  window.api.log.error('Failed to synchronise maps:', error);
  binding.current.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const handleFailure =
  (setState: Dispatch<SetStateAction<RMXP2StudioMapsUpdateStateObject>>, binding: MutableRefObject<RMXP2StudioMapsUpdateFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string | string[] }) => {
    setState({ state: 'done' });
    fail(binding, errorMessage);
  };

export const getSelectedMap = (newMaps: ProjectData['maps'], currentSelectedMap: DbSymbol) => {
  if (newMaps[currentSelectedMap]) return currentSelectedMap;

  return Object.keys(newMaps)[0] || '__undef__';
};
