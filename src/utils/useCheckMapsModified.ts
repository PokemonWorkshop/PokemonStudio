import { useEffect, useState } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import type { CheckMapsModifiedMethod } from '@src/backendTasks/checkMapsModified';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { showNotification } from './showNotification';
import { useTranslation } from 'react-i18next';

type CheckMapsModifiedFailureCallback = (error: { errorMessage: string }) => void;
type CheckMapsModifiedSuccessCallback = (payload: { dbSymbols: DbSymbol[] }) => void;
type CheckMapsModifiedPayload = {
  method: CheckMapsModifiedMethod;
  forceToast?: true;
};

type CheckMapsModifiedStateObject = { state: 'done' } | { state: 'checkMapsModified'; payload: CheckMapsModifiedPayload };

export const useCheckMapsModified = () => {
  const [callbacks, setCallbacks] = useState<
    { onFailure: CheckMapsModifiedFailureCallback; onSuccess: CheckMapsModifiedSuccessCallback } | undefined
  >(undefined);
  const [state, setState] = useState<CheckMapsModifiedStateObject>({ state: 'done' });
  const [globalState, setGlobalState] = useGlobalState();
  const { t } = useTranslation('database_maps');

  useEffect(() => {
    if (state.state !== 'checkMapsModified') return;
    if (!globalState.projectPath) {
      const errorMessage = t('error_no_project_load');
      showNotification('danger', t('checking_maps'), errorMessage);
      setState({ state: 'done' });
      callbacks?.onFailure({ errorMessage });
      return;
    }

    const maps = Object.values(globalState.projectData.maps).map((map) => JSON.stringify(map));
    return window.api.checkMapsModified(
      { projectPath: globalState.projectPath, maps, method: state.payload.method },
      ({ dbSymbols }) => {
        if (state.payload.forceToast || (dbSymbols.length !== 0 && globalState.mapsModified.length === 0)) {
          showNotification('info', t('checking_maps'), t('checking_maps_message'));
        }
        setGlobalState((currentState) => ({ ...currentState, mapModified: dbSymbols }));
        setState({ state: 'done' });
        callbacks?.onSuccess({ dbSymbols });
      },
      ({ errorMessage }) => {
        showNotification('danger', t('checking_maps'), errorMessage);
        setState({ state: 'done' });
        callbacks?.onFailure({ errorMessage });
      }
    );
  }, [state, callbacks]);

  return (payload: CheckMapsModifiedPayload, onSuccess: CheckMapsModifiedSuccessCallback, onFailure: CheckMapsModifiedFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'checkMapsModified', payload });
  };
};
