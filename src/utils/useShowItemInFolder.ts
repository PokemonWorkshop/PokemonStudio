import { useEffect, useState } from 'react';

type ShowItemInFolderFailureCallback = () => void;
type ShowItemInFolderSuccessCallback = () => void;
type ShowItemInFolderPayload = {
  filePath: string;
  extensions?: string[];
};

type ShowItemInFolderStateObject = { state: 'done' } | { state: 'showItemInFolder'; payload: ShowItemInFolderPayload };

export const useShowItemInFolder = () => {
  const [callbacks, setCallbacks] = useState<{ onFailure: ShowItemInFolderFailureCallback; onSuccess: ShowItemInFolderSuccessCallback } | undefined>(
    undefined
  );
  const [state, setState] = useState<ShowItemInFolderStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'done':
        window.api.cleanupShowItemInFolder();
        return;
      case 'showItemInFolder':
        return window.api.showItemInFolder(
          { filePath: state.payload.filePath, extensions: state.payload.extensions },
          () => {
            setState({ state: 'done' });
            callbacks?.onSuccess();
          },
          () => {
            setState({ state: 'done' });
            callbacks?.onFailure();
          }
        );
    }
  }, [state, callbacks]);

  return (payload: ShowItemInFolderPayload, onSuccess: ShowItemInFolderSuccessCallback, onFailure: ShowItemInFolderFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'showItemInFolder', payload });
  };
};
