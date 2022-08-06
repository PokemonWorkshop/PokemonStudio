import type ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { BackendTask, BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress } from '@utils/BackendTask';
import type { ProjectFileType } from './backendTasks/chooseProjectFileToOpen';
import { ProjectConfigsFromBackEnd } from './backendTasks/readProjectConfigs';
import { ProjectDataFromBackEnd } from './backendTasks/readProjectData';
import { ProjectText } from './GlobalStateProvider';

export {};

type ProjectCreationStepText = 'creating_project_extraction' | 'creating_project_configuration';

declare global {
  interface Window {
    api: {
      getAppVersion: () => Promise<string>;
      getPSDKBinariesPath: () => Promise<string>;
      getPSDKVersion: () => Promise<PSDKVersion>;
      getLastPSDKVersion: () => Promise<PSDKVersion>;
      updatePSDK: (
        currentVersion: number,
        onStatusUpdate: (current: number, total: number, version: PSDKVersion) => void,
        onDone: (success: boolean) => void
      ) => void;
      unregisterPSDKUpdateEvents: () => void;
      startPSDK: (projectPath: string) => void;
      registerProjectCreationListener: (listener: (step: number, total: number, stepText: ProjectCreationStepText) => void) => void;
      unregisterProjectCreationListener: () => void;
      platform: string;
      getStudioVersion: BackendTaskWithGenericErrorAndNoProgress<{}, { studioVersion: string }>;
      cleanupGetStudioVersion: () => void;
      chooseProjectFileToOpen: BackendTaskWithGenericErrorAndNoProgress<{ fileType: ProjectFileType }, { path: string; dirName: string }>;
      cleanupChooseProjectFileToOpen: () => void;
      getProjectInfo: BackendTaskWithGenericErrorAndNoProgress<{ path: string }, { gameTitle: string }>;
      cleanupGetProjectInfo: () => void;
      writeProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string; metaData: Omit<ProjectStudioModel, 'clone'> }, {}>;
      cleanupWriteProjectMetadata: () => void;
      readProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string }, { metaData: Omit<ProjectStudioModel, 'clone'> }>;
      cleanupReadProjectMetadata: () => void;
      readProjectConfigs: BackendTaskWithGenericError<{ path: string }, ProjectConfigsFromBackEnd, GenericBackendProgress>;
      cleanupReadProjectConfigs: () => void;
      readProjectData: BackendTaskWithGenericError<{ path: string }, ProjectDataFromBackEnd, GenericBackendProgress>;
      cleanupReadProjectData: () => void;
      readProjectTexts: BackendTaskWithGenericError<{ path: string }, ProjectText, GenericBackendProgress>;
      cleanupReadProjectTexts: () => void;
      migrateData: BackendTaskWithGenericError<{ projectPath: string; projectVersion: string }, ProjectText, GenericBackendProgress>;
      cleanupMigrateData: () => void;
    };
  }
}
