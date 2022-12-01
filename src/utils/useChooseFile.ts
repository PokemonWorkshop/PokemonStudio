import { useEffect, useState } from 'react';

type ChooseFileFailureCallback = () => void;
type ChooseFileSuccessCallback = (payload: { path: string }) => void;
type ChooseFilePayload = {
  name: string;
  extensions: string[];
};

type ChooseFileStateObject = { state: 'done' } | { state: 'choosingFile'; payload: ChooseFilePayload };

export const useChoosefile = () => {
  const [callbacks, setCallbacks] = useState<{ onFailure: ChooseFileFailureCallback; onSuccess: ChooseFileSuccessCallback } | undefined>(undefined);
  const [state, setState] = useState<ChooseFileStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupChooseFile();
        return;
      case 'choosingFile':
        return window.api.chooseFile(
          { name: state.payload.name, extensions: state.payload.extensions },
          ({ path }) => {
            setState({ state: 'done' });
            callbacks?.onSuccess({ path });
          },
          () => {
            setState({ state: 'done' });
            callbacks?.onFailure();
          }
        );
    }
  }, [state, callbacks]);

  return (payload: ChooseFilePayload, onSuccess: ChooseFileSuccessCallback, onFailure: ChooseFileFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'choosingFile', payload });
  };
};
