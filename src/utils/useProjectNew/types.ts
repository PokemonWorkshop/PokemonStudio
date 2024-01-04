import type { StudioProject } from '@modelEntities/project';

export type ProjectNewPayload = {
  projectStudioData: StudioProject;
  languageConfig: string;
  projectTitle: string;
  iconPath: string | undefined;
  multiLanguage: boolean;
};
export type ProjectNewFailureCallback = (error: { errorMessage: string }) => void;
export type ProjectNewSuccessCallback = (payload: { projectDirName: string }) => void;
export type ProjectNewStateObject =
  | { state: 'done' }
  | { state: 'choosingDestinationFolder'; payload: ProjectNewPayload }
  | { state: 'checkingFolderExist'; payload: ProjectNewPayload; projectDirName: string }
  | { state: 'readingVersion'; payload: ProjectNewPayload; projectDirName: string }
  | { state: 'extract'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string }
  | { state: 'configure'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string };

export type ProjectNewFunctionBinding = {
  onSuccess: ProjectNewSuccessCallback;
  onFailure: ProjectNewFailureCallback;
};
