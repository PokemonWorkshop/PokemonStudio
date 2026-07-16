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

/** Monotonic per-call sequence so concurrent backend tasks never share a channel. */
let backendTaskSeq = 0;
const nextBackendTaskSeq = () => (backendTaskSeq = (backendTaskSeq + 1) % Number.MAX_SAFE_INTEGER);

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
    // `Date.now()` alone is NOT unique: several tasks fired in the same tick
    // (e.g. a grid of tileset thumbnails all mounting on one render) collide on
    // one channel, so `once` listeners pile up (the "MaxListenersExceeded"
    // warning) and every colliding caller resolves with whichever response
    // arrives first — the rest get the wrong payload or none. A per-call
    // sequence makes each channel unique. Main just echoes the names back, so
    // renderer-side uniqueness is sufficient.
    const id = `${Date.now()}-${nextBackendTaskSeq()}`;
    const successChannelName = `${serviceName}/success-${id}`;
    const failureChannelName = `${serviceName}/failure-${id}`;
    const progressChannelName = `${serviceName}/progress-${id}`;
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
