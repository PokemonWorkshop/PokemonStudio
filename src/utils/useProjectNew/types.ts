import type { StudioProject } from '@modelEntities/project';
import type { LatestNewProject } from '@src/backendTasks/checkDownloadNewProject';

export const DefaultLanguages = ['en', 'fr', 'es', 'pt'] as const;
export type DefaultLanguageType = (typeof DefaultLanguages)[number];
export type NewProjectData = Omit<StudioProject, 'studioVersion' | 'iconPath' | 'isTiledMode'> & {
  icon?: string;
  defaultLanguage: DefaultLanguageType;
  multiLanguage: boolean;
};

export type ProjectNewPayload = NewProjectData;
export type ProjectNewFailureCallback = (error: { errorMessage: string }) => void;
export type ProjectNewSuccessCallback = (payload: { projectDirName: string }) => void;
export type ProjectNewStateObject =
  | { state: 'done' }
  | { state: 'choosingDestinationFolder'; payload: ProjectNewPayload }
  | { state: 'checkingFolderExist'; payload: ProjectNewPayload; projectDirName: string }
  | { state: 'readingVersion'; payload: ProjectNewPayload; projectDirName: string }
  | { state: 'checkingNeedDownload'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string }
  | { state: 'download'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string; latestFile: LatestNewProject }
  | { state: 'extract'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string }
  | { state: 'configure'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string };

export type ProjectNewFunctionBinding = {
  onSuccess: ProjectNewSuccessCallback;
  onFailure: ProjectNewFailureCallback;
};
