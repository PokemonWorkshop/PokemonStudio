import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ProjectSaveFunctionBinding, ProjectSaveStateObject } from './types';
import { DEFAULT_PROCESS_STATE } from '@hooks/useProcess';
import { State } from '@src/GlobalStateProvider';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';

export const fail = (binding: MutableRefObject<ProjectSaveFunctionBinding>, error: unknown) => {
  window.api.log.error('Failed to save the project', error);
  binding.current.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const handleFailure =
  (setState: Dispatch<SetStateAction<ProjectSaveStateObject>>, binding: MutableRefObject<ProjectSaveFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string }) => {
    setState(DEFAULT_PROCESS_STATE);
    fail(binding, errorMessage);
  };

export const isMapsToSaveFunc = (globalState: State) => {
  const result = Array.from(globalState.savingData.map.keys()).find((key) => key.startsWith('maps/')) !== undefined || globalState.savingMapInfo;
  if (result) return result;

  const mapNameTextId = MAP_NAME_TEXT_ID.toString();
  const mapDescrTextId = MAP_DESCRIPTION_TEXT_ID.toString();
  return Array.from(globalState.savingText.map.keys()).find((key) => key === mapNameTextId || key === mapDescrTextId) !== undefined;
};
