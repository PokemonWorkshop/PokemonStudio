import { useEffect, useState } from 'react';

type OpenStudioLogsFolderFailureCallback = (error: { errorMessage: string }) => void;
type OpenStudioLogsFolderSuccessCallback = () => void;

type OpenStudioLogsFolderStateObject = { state: 'done' } | { state: 'open_studio_logs_folder' };

const fail = (callbacks: { onFailure: OpenStudioLogsFolderFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useOpenStudioLogsFolder = () => {
  const [callbacks, setCallbacks] = useState<
    { onFailure: OpenStudioLogsFolderFailureCallback; onSuccess: OpenStudioLogsFolderSuccessCallback } | undefined
  >(undefined);
  const [state, setState] = useState<OpenStudioLogsFolderStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupOpenStudioLogsFolder();
        return;
      case 'open_studio_logs_folder':
        return window.api.openStudioLogsFolder(
          {},
          () => {
            setState({ state: 'done' });
            callbacks?.onSuccess();
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
    }
  }, [state, callbacks]);

  return (onSuccess: OpenStudioLogsFolderSuccessCallback, onFailure: OpenStudioLogsFolderFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'open_studio_logs_folder' });
  };
};
