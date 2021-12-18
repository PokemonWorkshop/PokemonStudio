import { PSDKIpcService } from '@services/PSDKIPC/psdk.ipc.service';
import { execCommandInPSDK, isPSDKRunning, startPSDK } from '@services/PSDKIPC/psdk.ipc.utils';
import { useEffect, useMemo, useState } from 'react';
import { showNotification } from './showNotification';

/**
 * Hook allowing you to import a PSDK project
 * @example // Importing a PSDK project
 *   const { loading, error, success, busy, start } = useProjectImportFromPSDK();
 *   useEffect(() => {
 *     if (error) {
 *       showNotification('danger', 'Import', error.message);
 *     } else if (success) {
 *       showNotification('success', 'Import', 'Project conversion was successfull');
 *     }
 *   }, [error, success]);
 *   return <Button disabled={loading || busy} onClick={start('D:/nuriy/Work/pokemonsdk')} />
 */
export const useProjectImportFromPSDK = (reportProgress = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  const ipcService = useMemo(() => new PSDKIpcService(), []);

  useEffect(() => {
    if (loading) {
      startPSDK(ipcService, projectPath, {
        'psdk-exec.exit': (code) => {
          setLoading(false);
          setBusy(false);
          if (code !== 0 && !error) {
            setError(new Error('Failed to convert project'));
          }
        },
        'psdk-exec.stderr.data': (data) => {
          const payload = JSON.parse(data);
          setError(new Error(payload.error_message || payload.message || 'Failed to convert project'));
        },
        'psdk-exec.stdout.data': (data) => {
          if (!data.startsWith('{')) return; // Prevent the code page or other batch message
          const payload = JSON.parse(data);
          if (payload.ready) {
            return execCommandInPSDK(ipcService, projectPath, `${JSON.stringify({ action: 'importProjectToStudio' })}\n`, () => {});
          }
          if (payload.done) {
            setLoading(false);
            setSuccess(true);
            return execCommandInPSDK(ipcService, projectPath, `${JSON.stringify({ action: 'exit' })}\n`, () => {});
          }
          if (reportProgress && payload.progress) {
            showNotification('info', 'Import', payload.message);
          }
        },
      });
    }

    isPSDKRunning(ipcService, (isRunning) => setBusy(isRunning));

    return () => {};
  }, [ipcService, loading, projectPath, reportProgress]);

  return {
    loading,
    error,
    success,
    busy,
    start: (path: string) => {
      setProjectPath(path);
      setError(undefined);
      setSuccess(false);
      setLoading(true);
    },
    reset: () => {
      setError(undefined);
      setSuccess(false);
      setLoading(false);
    },
  };
};

type PSDKImportFailureCallback = (error: { errorMessage: string }) => void;
type PSDKImportSuccessCallback = (payload: {}) => void;
export const useProjectImportFromPSDKv2 = () => {
  const { error, success, start, reset } = useProjectImportFromPSDK();
  const [callbacks, setCallbacks] = useState<{ onFailure: PSDKImportFailureCallback; onSuccess: PSDKImportSuccessCallback } | undefined>(undefined);

  useEffect(() => {
    if (!callbacks) return;
    if (error) {
      callbacks.onFailure({ errorMessage: error.message });
    } else if (success) {
      callbacks.onSuccess({});
    }
  }, [error, success, callbacks]);

  return (payload: { projectDirName: string }, onSuccess: PSDKImportSuccessCallback, onFailure: PSDKImportFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    reset();
    start(payload.projectDirName);
  };
};
