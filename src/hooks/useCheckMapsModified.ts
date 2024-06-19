import { useEffect, useState } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import type { CheckMapsModifiedMethod } from '@src/backendTasks/checkMapsModified';
import { showNotification } from '../utils/showNotification';
import { useTranslation } from 'react-i18next';
import { getSetting } from '../utils/settings';

type CheckMapsModifiedPayload = {
  method: CheckMapsModifiedMethod;
  forceToast?: true;
};

type CheckMapsModifiedStateObject = { state: 'done' } | { state: 'checkMapsModified'; payload: CheckMapsModifiedPayload };

export const useCheckMapsModified = () => {
  const [state, setState] = useState<CheckMapsModifiedStateObject>({ state: 'done' });
  const [globalState, setGlobalState] = useGlobalState();
  const { t } = useTranslation('database_maps');

  useEffect(() => {
    if (state.state !== 'checkMapsModified') return;

    if (!globalState.projectPath) {
      const errorMessage = t('error_no_project_load');
      showNotification('danger', t('checking_maps'), errorMessage);
      setState({ state: 'done' });
      return;
    }

    const maps = Object.values(globalState.projectData.maps)
      .map((map) => ({ dbSymbol: map.dbSymbol, tiledFilename: map.tiledFilename, sha1: map.sha1, mtime: map.mtime }))
      .map((data) => JSON.stringify(data));
    return window.api.checkMapsModified(
      { projectPath: globalState.projectPath, maps, method: state.payload.method, tiledExecPath: getSetting('tiledPath') },
      ({ dbSymbols }) => {
        if (state.payload.forceToast || (dbSymbols.length !== 0 && globalState.mapsModified.length === 0)) {
          showNotification('info', t('checking_maps'), t('checking_maps_message'));
        }
        setGlobalState((currentState) => ({ ...currentState, mapsModified: dbSymbols }));
        setState({ state: 'done' });
      },
      ({ errorMessage }) => {
        showNotification('danger', t('checking_maps'), errorMessage);
        setState({ state: 'done' });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, globalState.mapsModified, globalState.projectPath, globalState.projectData.maps]);

  return {
    checkMaps: (payload: CheckMapsModifiedPayload) => setState({ state: 'checkMapsModified', payload }),
    state: globalState,
  };
};
