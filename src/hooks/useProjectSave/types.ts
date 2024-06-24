export type ProjectSaveStateObject =
  | { state: 'done' }
  | { state: 'saveData'; projectPath: string }
  | { state: 'saveConfigs'; projectPath: string }
  | { state: 'saveTexts'; projectPath: string }
  | { state: 'saveTextInfo'; projectPath: string }
  | { state: 'saveMapInfo'; projectPath: string }
  | { state: 'saveRMXPMapInfo'; projectPath: string }
  | { state: 'updateStudioFile'; projectPath: string }
  | { state: 'updateProjectList'; projectPath: string }
  | { state: 'resetSaving' };

export type ProjectSaveFailureCallback = (error: { errorMessage: string }) => void;
export type ProjectSaveSuccessCallback = (payload: Record<string, never>) => void;
export type ProjectSaveFunctionBinding = {
  onSuccess: ProjectSaveSuccessCallback;
  onFailure: ProjectSaveFailureCallback;
};
