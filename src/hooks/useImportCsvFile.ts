import { useEffect, useState } from 'react';
import { ProjectText } from '@src/GlobalStateProvider';
import { useNewProjectText } from '../utils/ReadingProjectText';

type ImportCsvFileStateObject =
  | { state: 'done' }
  | { state: 'readCsvFile'; payload: ImportCsvFilePayload }
  | { state: 'updateProjectText'; payload: ImportCsvFilePayload; projectText: ProjectText };

type ImportCsvFileFailureCallback = (error: { errorMessage: string }) => void;
type ImportCsvFileSuccessCallback = () => void;
type ImportCsvFilePayload = {
  filePath: string;
  fileId: number;
};

const fail = (callbacks: { onFailure: ImportCsvFileFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useImportCsvFile = () => {
  const setNewProjectText = useNewProjectText();
  const [callbacks, setCallbacks] = useState<{ onFailure: ImportCsvFileFailureCallback; onSuccess: ImportCsvFileSuccessCallback } | undefined>(
    undefined
  );
  const [localState, setLocalState] = useState<ImportCsvFileStateObject>({ state: 'done' });

  useEffect(() => {
    switch (localState.state) {
      case 'readCsvFile':
        return window.api.readCsvFile(
          { filePath: localState.payload.filePath, fileId: localState.payload.fileId },
          (projectText) => setLocalState({ ...localState, state: 'updateProjectText', projectText }),
          ({ errorMessage }) => {
            setLocalState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'updateProjectText': {
        const fileId = localState.payload.fileId;
        setNewProjectText(fileId, localState.projectText[fileId]);
        setLocalState({ state: 'done' });
        callbacks?.onSuccess();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localState, callbacks]);

  return (payload: ImportCsvFilePayload, onSuccess: ImportCsvFileSuccessCallback, onFailure: ImportCsvFileFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setLocalState({ state: 'readCsvFile', payload });
  };
};
