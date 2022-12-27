import { useGlobalState } from '@src/GlobalStateProvider';
import { useEffect, useState } from 'react';
import { basename, dirname, join } from './path';

type CopyFileFailureCallback = (error: { errorMessage: string }) => void;
type CopyFileSuccessCallback = (payload: { destFile: string }) => void;
type CopyFilePayload = {
  srcFile: string;
  destFolder: string;
};

type CopyFileStateObject = { state: 'done' } | { state: 'copyFile'; payload: CopyFilePayload };

export const useCopyFile = () => {
  const [callbacks, setCallbacks] = useState<{ onFailure: CopyFileFailureCallback; onSuccess: CopyFileSuccessCallback } | undefined>(undefined);
  const [state, setState] = useState<CopyFileStateObject>({ state: 'done' });
  const [globalState] = useGlobalState();

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupCopyFile();
        return;
      case 'copyFile': {
        if (dirname(state.payload.srcFile) === join(globalState.projectPath || '', state.payload.destFolder)) {
          setState({ state: 'done' });
          callbacks?.onSuccess({ destFile: state.payload.srcFile });
          return;
        }
        const destFile = join(globalState.projectPath || '', state.payload.destFolder, basename(state.payload.srcFile));
        return window.api.copyFile(
          { srcFile: state.payload.srcFile, destFile: destFile },
          () => {
            setState({ state: 'done' });
            callbacks?.onSuccess({ destFile });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            callbacks?.onFailure({ errorMessage });
          }
        );
      }
    }
  }, [state, callbacks]);

  return (payload: CopyFilePayload, onSuccess: CopyFileSuccessCallback, onFailure: CopyFileFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'copyFile', payload });
  };
};
