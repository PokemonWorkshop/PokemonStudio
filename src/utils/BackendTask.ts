export type GenericBackendProgress = { step: number; total: number; stepText: string };

/**
 * BackendTask are meant to be used instead of ipcRenderer.invoke.
 * Promises in useEffect on renderer side are not good because they're hard to cleanup since Promises cannot be cancelled!
 *
 * BackendTask defines a task that stands over 4 channels:
 * - taskName : which receive the payload of the frontEnd in order to perform the task
 * - taskName/success : which receive the output payload when the task successfully performed its task
 * - taskName/failure : which receive the error coming from the task if something went wrong (in such case no success nor progress will be sent after)
 * - taskName/progress : which receive the progress of the task when it's pretty long
 *
 * You can use defineBackendTask(ipcRenderer, taskName) in order to define the task in contextBridge.
 * You can also use cleanupBackendTask(ipcRenderer, taskName) in order to define the task cleanup in contextBridge so front end can call it!
 *
 * TODO: Test the two last functions when preload.js will be preload.ts!
 */
export type BackendTask<
  TaskInputPayloadType extends {},
  TaskOutputPayloadType extends {},
  ErrorType extends { errorMessage: string },
  ProgressPayloadType extends GenericBackendProgress
> = (
  taskPayload: TaskInputPayloadType,
  onSuccess: (payload: TaskOutputPayloadType) => void,
  onFailure: (error: ErrorType) => void,
  onProgress?: (payload: ProgressPayloadType) => void
) => void;

export type BackendTaskWithGenericError<
  TaskInputPayloadType extends {},
  TaskOutputPayloadType extends {},
  ProgressPayloadType extends GenericBackendProgress
> = BackendTask<TaskInputPayloadType, TaskOutputPayloadType, { errorMessage: string }, ProgressPayloadType>;

export type BackendTaskWithNoProgress<
  TaskInputPayloadType extends {},
  TaskOutputPayloadType extends {},
  ErrorType extends { errorMessage: string }
> = (taskPayload: TaskInputPayloadType, onSuccess: (payload: TaskOutputPayloadType) => void, onFailure: (error: ErrorType) => void) => void;

export type BackendTaskWithGenericErrorAndNoProgress<TaskInputPayloadType extends {}, TaskOutputPayloadType extends {}> = BackendTaskWithNoProgress<
  TaskInputPayloadType,
  TaskOutputPayloadType,
  { errorMessage: string }
>;

// TODO: use this function when preload.js will be preload.ts :)
export const defineBackendTask = <
  TaskInputPayloadType extends {},
  TaskOutputPayloadType extends {},
  ErrorType extends { errorMessage: string },
  ProgressPayloadType extends { step: number; total: number; stepText: string }
>(
  ipcRenderer: Electron.IpcRenderer,
  serviceName: string
) => {
  return (
    taskPayload: TaskInputPayloadType,
    onSuccess: (payload: TaskOutputPayloadType) => void,
    onFailure: (error: ErrorType) => void,
    onProgress?: (payload: ProgressPayloadType) => void
  ) => {
    // Register success event
    ipcRenderer.once(`${serviceName}/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`${serviceName}/failure`);
      ipcRenderer.removeAllListeners(`${serviceName}/progress`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`${serviceName}/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`${serviceName}/success`);
      ipcRenderer.removeAllListeners(`${serviceName}/progress`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`${serviceName}/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send(serviceName, taskPayload);
  };
};

// TODO: use this function when preload.js will be preload.ts :)
export const cleanupBackendTask = (ipcRenderer: Electron.IpcRenderer, serviceName: string) => () => {
  ipcRenderer.removeAllListeners(`${serviceName}/success`);
  ipcRenderer.removeAllListeners(`${serviceName}/failure`);
  ipcRenderer.removeAllListeners(`${serviceName}/progress`);
};
