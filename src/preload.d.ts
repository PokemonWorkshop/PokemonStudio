import { IpcRendererEvent } from 'electron';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress } from '@utils/BackendTask';
import type { ProjectFileType } from './backendTasks/chooseProjectFileToOpen';
import { ConfigureNewProjectMetaData } from './backendTasks/configureNewProject';
import { ProjectConfigsFromBackEnd } from './backendTasks/readProjectConfigs';
import { ProjectDataFromBackEnd } from './backendTasks/readProjectData';
import { ProjectText } from './GlobalStateProvider';
import { StudioShortcut } from '@utils/useShortcuts';
import { ProjectStudioAction, SavingConfig, SavingData, SavingImage, SavingText } from '@utils/SavingUtils';
import { ShowMessageBoxTranslation } from './backendTasks/copyFile';
import { StudioProject } from '@modelEntities/project';

export {};

declare global {
  interface Window {
    api: {
      clearCache: () => void;
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
      getStudioVersion: BackendTaskWithGenericErrorAndNoProgress<Record<string, never>, { studioVersion: string }>;
      cleanupGetStudioVersion: () => void;
      chooseProjectFileToOpen: BackendTaskWithGenericErrorAndNoProgress<{ fileType: ProjectFileType }, { path: string; dirName: string }>;
      cleanupChooseProjectFileToOpen: () => void;
      getProjectInfo: BackendTaskWithGenericErrorAndNoProgress<{ path: string }, { gameTitle: string }>;
      cleanupGetProjectInfo: () => void;
      writeProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string; metaData: StudioProject }, Record<string, never>>;
      cleanupWriteProjectMetadata: () => void;
      readProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string }, { metaData: StudioProject }>;
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
      updateMapInfos: BackendTaskWithGenericErrorAndNoProgress<{ projectPath: string }, Record<string, never>>;
      cleanupUpdateMapInfos: () => void;
      chooseFolder: BackendTaskWithGenericErrorAndNoProgress<Record<string, never>, { folderPath: string }>;
      cleanupChooseFolder: () => void;
      extractNewProject: BackendTaskWithGenericError<
        { projectDirName: string },
        Record<string, never>,
        { step: number; total: number; stepText: string }
      >;
      cleanupExtractNewProject: () => void;
      configureNewProject: BackendTaskWithGenericErrorAndNoProgress<
        { projectDirName: string; metaData: ConfigureNewProjectMetaData },
        Record<string, never>
      >;
      cleanupConfigureNewProject: () => void;
      saveProjectData: BackendTaskWithGenericErrorAndNoProgress<{ path: string; data: SavingData }, Record<string, never>>;
      cleanupSaveProjectData: () => void;
      saveProjectConfigs: BackendTaskWithGenericErrorAndNoProgress<{ path: string; configs: SavingConfig }, Record<string, never>>;
      cleanupSaveProjectConfigs: () => void;
      saveProjectTexts: BackendTaskWithGenericErrorAndNoProgress<{ path: string; texts: SavingText }, Record<string, never>>;
      cleanupSaveProjectTexts: () => void;
      moveImage: BackendTaskWithGenericErrorAndNoProgress<{ path: string; images: SavingImage }, Record<string, never>>;
      cleanupMoveImage: () => void;
      projectStudioFile: BackendTaskWithGenericErrorAndNoProgress<
        { path: string; action: ProjectStudioAction; data?: string },
        { fileData?: string }
      >;
      cleanupProjectStudioFile: () => void;
      chooseFile: BackendTaskWithGenericErrorAndNoProgress<{ name: string; extensions: string[] }, { path: string; dirName: string }>;
      cleanupChooseFile: () => void;
      showItemInFolder: BackendTaskWithGenericErrorAndNoProgress<{ filePath: string }, Record<string, never>>;
      cleanupShowItemInFolder: () => void;
      copyFile: BackendTaskWithGenericErrorAndNoProgress<{ srcFile: string; destFile: string; translation: ShowMessageBoxTranslation }, {}>;
      cleanupCopyFile: () => void;
    };
  }
}
