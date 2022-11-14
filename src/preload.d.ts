import { IpcRendererEvent } from 'electron';
import type ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress } from '@utils/BackendTask';
import type { ProjectFileType } from './backendTasks/chooseProjectFileToOpen';
import { ConfigureNewProjectMetaData } from './backendTasks/configureNewProject';
import { ProjectConfigsFromBackEnd } from './backendTasks/readProjectConfigs';
import { ProjectDataFromBackEnd } from './backendTasks/readProjectData';
import { ProjectText } from './GlobalStateProvider';
import { StudioShortcut } from '@utils/useShortcuts';

export {};

declare global {
  interface Window {
    api: {
      shortcut: {
        on: (cb: (shortcut: StudioShortcut) => unknown) => (event: IpcRendererEvent, args: unknown) => void;
        removeListener: (listener: (event: IpcRendererEvent, args: unknown) => void) => void;
      };
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
      startPSDKDebug: (projectPath: string) => void;
      startPSDKTags: (projectPath: string) => void;
      startPSDKWorldmap: (projectPath: string) => void;
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
      fileExists: BackendTaskWithGenericErrorAndNoProgress<{ filePath: string }, { result: boolean }>;
      cleanupFileExists: () => void;
      updateMapInfos: BackendTaskWithGenericErrorAndNoProgress<{ projectPath: string }, {}>;
      cleanupUpdateMapInfos: () => void;
      chooseFolder: BackendTaskWithGenericErrorAndNoProgress<{}, { folderPath: string }>;
      cleanupChooseFolder: () => void;
      extractNewProject: BackendTaskWithGenericError<{ projectDirName: string }, {}, { step: number; total: number; stepText: string }>;
      cleanupExtractNewProject: () => void;
      configureNewProject: BackendTaskWithGenericErrorAndNoProgress<{ projectDirName: string; metaData: ConfigureNewProjectMetaData }, {}>;
      cleanupConfigureNewProject: () => void;
    };
  }
}
