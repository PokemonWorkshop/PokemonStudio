import { useGlobalState } from '@src/GlobalStateProvider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('show_message_box');

  useEffect(() => {
    if (state.state !== 'copyFile') return;

    if (dirname(state.payload.srcFile) === join(globalState.projectPath || '', state.payload.destFolder)) {
      setState({ state: 'done' });
      callbacks?.onSuccess({ destFile: state.payload.srcFile });
      return;
    }
    const filename = basename(state.payload.srcFile);
    const destFile = join(globalState.projectPath || '', state.payload.destFolder, filename);
    return window.api.copyFile(
      { srcFile: state.payload.srcFile, destFile: destFile, translation: { title: t('copy_title'), message: t('copy_message', { filename }) } },
      () => {
        window.api.clearCache();
        setState({ state: 'done' });
        callbacks?.onSuccess({ destFile });
      },
      ({ errorMessage }) => {
        setState({ state: 'done' });
        callbacks?.onFailure({ errorMessage });
      }
    );
  }, [state, callbacks]);

  return (payload: CopyFilePayload, onSuccess: CopyFileSuccessCallback, onFailure: CopyFileFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'copyFile', payload });
  };
};
