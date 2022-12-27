import { useEffect, useState } from 'react';
import { useCopyFile } from './useCopyFile';

type ChooseFileFailureCallback = (error?: { errorMessage: string }) => void;
type ChooseFileSuccessCallback = (payload: { path: string }) => void;
type ChooseFilePayload = {
  name: string;
  extensions: string[];
  destFolderToCopy?: string;
};

type ChooseFileStateObject =
  | { state: 'done' }
  | { state: 'choosingFile'; payload: ChooseFilePayload }
  | { state: 'copyFile'; payload: ChooseFilePayload; chosenFile: string };

export const useChoosefile = () => {
  const [callbacks, setCallbacks] = useState<{ onFailure: ChooseFileFailureCallback; onSuccess: ChooseFileSuccessCallback } | undefined>(undefined);
  const [state, setState] = useState<ChooseFileStateObject>({ state: 'done' });
  const copyFile = useCopyFile();

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupChooseFile();
        return;
      case 'choosingFile':
        return window.api.chooseFile(
          { name: state.payload.name, extensions: state.payload.extensions },
          ({ path: chosenFile }) => {
            if (state.payload.destFolderToCopy) setState({ ...state, state: 'copyFile', chosenFile });
            else {
              setState({ state: 'done' });
              callbacks?.onSuccess({ path: chosenFile });
            }
          },
          () => {
            setState({ state: 'done' });
            callbacks?.onFailure();
          }
        );
      case 'copyFile': {
        if (!state.payload.destFolderToCopy) {
          setState({ state: 'done' });
          callbacks?.onSuccess({ path: state.chosenFile });
          return;
        }
        return copyFile(
          { srcFile: state.chosenFile, destFolder: state.payload.destFolderToCopy },
          ({ destFile }) => {
            setState({ state: 'done' });
            callbacks?.onSuccess({ path: destFile });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            callbacks?.onFailure({ errorMessage });
          }
        );
      }
    }
  }, [state, callbacks]);

  return (payload: ChooseFilePayload, onSuccess: ChooseFileSuccessCallback, onFailure: ChooseFileFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'choosingFile', payload });
  };
};
