export type MapCopyGenericFailureCallback = (genericError: string) => void;
export type MapCopyFailureCallback = (errorMessage: string) => void;
export type MapCopySuccessCallback = (payload: Record<string, never>) => void;
export type MapCopyStateObject = { state: 'done' } | { state: 'copy'; tmxFile: string };
export type MapCopyFunctionBinding = {
  onSuccess: MapCopySuccessCallback;
  onFailure: MapCopyFailureCallback;
  onGenericFailure: MapCopyGenericFailureCallback;
};
