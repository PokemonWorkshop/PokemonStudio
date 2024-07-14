import { useEffect, useState } from 'react';
import { getSetting } from '@utils/settings';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useLoaderRef } from '@utils/loaderContext';
import { useTranslation } from 'react-i18next';

type GeneratingMapOverviewFailureCallback = (error: { errorMessage: string }) => void;
type GeneratingMapOverviewSuccessCallback = () => void;
type GeneratingMapOverviewPayload = {
  tiledFilename: string;
};

type GeneratingMapOverviewStateObject = { state: 'done' } | { state: 'generating'; payload: GeneratingMapOverviewPayload };

export const useGeneratingMapOverview = () => {
  const [callbacks, setCallbacks] = useState<
    { onFailure: GeneratingMapOverviewFailureCallback; onSuccess: GeneratingMapOverviewSuccessCallback } | undefined
  >(undefined);
  const [state, setState] = useState<GeneratingMapOverviewStateObject>({ state: 'done' });
  const { t } = useTranslation('database_maps');
  const [globalState] = useGlobalState();
  const loaderRef = useLoaderRef();

  useEffect(() => {
    if (!globalState.projectPath) {
      callbacks?.onFailure({ errorMessage: 'The project path is not defined.' });
      return setState({ state: 'done' });
    }

    switch (state.state) {
      case 'generating':
        loaderRef.current.open('updating_maps', 0, 0, t('map_overview_generating'));
        return window.api.generatingMapOverview(
          {
            projectPath: globalState.projectPath,
            tiledFilename: state.payload.tiledFilename,
            tiledExecPath: getSetting('tiledPath'),
          },
          () => {
            callbacks?.onSuccess();
            setState({ state: 'done' });
          },
          ({ errorMessage }) => {
            callbacks?.onFailure({ errorMessage });
            setState({ state: 'done' });
          }
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, callbacks]);

  return (
    payload: GeneratingMapOverviewPayload,
    onSuccess: GeneratingMapOverviewSuccessCallback,
    onFailure: GeneratingMapOverviewFailureCallback
  ) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'generating', payload });
  };
};
