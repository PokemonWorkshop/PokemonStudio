import PSDKConfigModel from '@modelEntities/PSDKConfig.model';
import { PSDKIpcService } from '@services/PSDKIPC/psdk.ipc.service';
import { execCommandInPSDK, isPSDKRunning, startPSDK } from '@services/PSDKIPC/psdk.ipc.utils';
import { useEffect, useMemo, useState } from 'react';
import { deserializePSDKConfig } from './SerializationUtils';
import { showNotification } from './showNotification';

export const useProjectConfigFromPSDK = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  const [psdkConfig, setPSDKConfig] = useState<PSDKConfigModel>();
  const ipcService = useMemo(() => new PSDKIpcService(), []);

  useEffect(() => {
    if (loading) {
      startPSDK(ipcService, projectPath, {
        'psdk-exec.exit': (code) => {
          setLoading(false);
          setBusy(false);
          if (code !== 0) {
            setError(new Error('Failed to get psdk project config'));
          }
        },
        'psdk-exec.stderr.data': (data) => {
          const payload = JSON.parse(data);
          showNotification('warning', payload.klass || payload.type || 'STDERR', payload.error_message || payload.message);
        },
        'psdk-exec.stdout.data': (data) => {
          const payload = JSON.parse(data);
          if (payload.ready) {
            return execCommandInPSDK(ipcService, projectPath, `${JSON.stringify({ action: 'psdkConfig' })}\n`, () => {});
          }
          if (payload.done) {
            setLoading(false);
            setPSDKConfig(deserializePSDKConfig(payload.psdkConfig));
            setSuccess(true);
            return execCommandInPSDK(ipcService, projectPath, `${JSON.stringify({ action: 'exit' })}\n`, () => {});
          }
        },
      });
    }

    isPSDKRunning(ipcService, (isRunning) => setBusy(isRunning));

    return () => {};
  }, [ipcService, loading, projectPath]);

  return {
    loading,
    error,
    success,
    busy,
    psdkConfig,
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
