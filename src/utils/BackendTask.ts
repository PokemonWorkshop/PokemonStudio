import type { IpcMainEvent } from 'electron/main';
import type { IpcRenderer } from 'electron/renderer';

export type ChannelNames = {
  successChannelName: string;
  failureChannelName: string;
  progressChannelName: string;
};

/**
 * Type to use when defining a mainProcess service task
 * @example
 * const doStuff = async (event: IpcMainEvent, { channels, payload }: BackendTaskFunctionInput<{ path: string }>) => {
 *   event.sender.send(channels.successChannelName, payload.path);
 * }
 */
export type BackendTaskFunctionInput<TaskInputPayloadType extends Record<string, unknown>> = {
  channels: ChannelNames;
  payload: TaskInputPayloadType;
};

export type GenericBackendProgress = { step: number; total: number; stepText: string };
export type GenericBackendError = { errorMessage: string };

/**
 * Type to use when defining a rendererProcess api method
 * @example
 * declare global {
 *   interface Window {
 *     yourAPI: { yourFunction: BackendTask<{ input: number }, { output: number }, GenericBackendError, GenericBackendProgress> }
 *   }
 * }
 * // in another file
 * useEffect(() => {
 *   return window.yourAPI.yourFunction({ input: 5 }, ({ output }) => setState(output), ({ errorMessage }) => setError(errorMessage));
 * }, [])
 */
export type BackendTask<
  TaskInputPayloadType extends Record<string, never>,
  TaskOutputPayloadType extends Record<string, never>,
  ErrorType extends GenericBackendError,
  ProgressPayloadType extends GenericBackendProgress
> = (
  taskPayload: TaskInputPayloadType,
  onSuccess: (payload: TaskOutputPayloadType) => void,
  onFailure: (error: ErrorType) => void,
  onProgress?: (payload: ProgressPayloadType) => void
) => () => void;

/**
 * Type to use when defining a rendererProcess api method without having to defined error type
 * @example
 * declare global {
 *   interface Window {
 *     yourAPI: { yourFunction: BackendTaskWithGenericError<{ input: number }, { output: number }, GenericBackendProgress> }
 *   }
 * }
 * // in another file
 * useEffect(() => {
 *   return window.yourAPI.yourFunction({ input: 5 }, ({ output }) => setState(output), ({ errorMessage }) => setError(errorMessage));
 * }, [])
 */
export type BackendTaskWithGenericError<
  TaskInputPayloadType extends Record<string, never>,
  TaskOutputPayloadType extends Record<string, never>,
  ProgressPayloadType extends GenericBackendProgress
> = BackendTask<TaskInputPayloadType, TaskOutputPayloadType, { errorMessage: string }, ProgressPayloadType>;

/**
 * Type to use when defining a rendererProcess api method with no progress
 * @example
 * declare global {
 *   interface Window {
 *     yourAPI: { yourFunction: BackendTaskWithNoProgress<{ input: number }, { output: number }, GenericBackendError> }
 *   }
 * }
 * // in another file
 * useEffect(() => {
 *   return window.yourAPI.yourFunction({ input: 5 }, ({ output }) => setState(output), ({ errorMessage }) => setError(errorMessage));
 * }, [])
 */
export type BackendTaskWithNoProgress<
  TaskInputPayloadType extends Record<string, never>,
  TaskOutputPayloadType extends Record<string, never>,
  ErrorType extends { errorMessage: string }
> = (taskPayload: TaskInputPayloadType, onSuccess: (payload: TaskOutputPayloadType) => void, onFailure: (error: ErrorType) => void) => () => void;

/**
 * Type to use when defining a rendererProcess api method with generic error & no progress
 * @example
 * declare global {
 *   interface Window {
 *     yourAPI: { yourFunction: BackendTaskWithGenericErrorAndNoProgress<{ input: number }, { output: number }> }
 *   }
 * }
 * // in another file
 * useEffect(() => {
 *   return window.yourAPI.yourFunction({ input: 5 }, ({ output }) => setState(output), ({ errorMessage }) => setError(errorMessage));
 * }, [])
 */
export type BackendTaskWithGenericErrorAndNoProgress<
  TaskInputPayloadType extends Record<string, never>,
  TaskOutputPayloadType extends Record<string, never>
> = BackendTaskWithNoProgress<TaskInputPayloadType, TaskOutputPayloadType, { errorMessage: string }>;

export const defineBackendTask = <
  TaskInputPayloadType extends Record<string, unknown>,
  TaskOutputPayloadType extends Record<string, unknown>,
  ErrorType extends { errorMessage: string },
  ProgressPayloadType extends { step: number; total: number; stepText: string }
>(
  ipcRenderer: IpcRenderer,
  serviceName: string
) => {
  return (
    taskPayload: TaskInputPayloadType,
    onSuccess: (payload: TaskOutputPayloadType) => void,
    onFailure: (error: ErrorType) => void,
    onProgress?: (payload: ProgressPayloadType) => void
  ) => {
    const now = Date.now();
    const successChannelName = `${serviceName}/success-${now}`;
    const failureChannelName = `${serviceName}/failure-${now}`;
    const progressChannelName = `${serviceName}/progress-${now}`;
    const cleanup = () => {
      ipcRenderer.removeAllListeners(successChannelName);
      ipcRenderer.removeAllListeners(failureChannelName);
      ipcRenderer.removeAllListeners(progressChannelName);
    };
    // Register success event
    ipcRenderer.once(successChannelName, (_, payload) => {
      cleanup();
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(failureChannelName, (_, error) => {
      cleanup();
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(progressChannelName, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send(serviceName, { channels: { successChannelName, failureChannelName, progressChannelName }, payload: taskPayload });

    return cleanup;
  };
};

export const sendFailure = (event: IpcMainEvent, channels: ChannelNames, error: unknown) => {
  event.sender.send(channels.failureChannelName, { errorMessage: `${error instanceof Error ? error.message : error}` });
};

export const sendSuccess = <OutputPayload extends Record<string, unknown>>(event: IpcMainEvent, channels: ChannelNames, payload: OutputPayload) => {
  event.sender.send(channels.successChannelName, payload);
};

export const sendProgress = (event: IpcMainEvent, channels: ChannelNames, progress: GenericBackendProgress) => {
  event.sender.send(channels.progressChannelName, progress);
};
