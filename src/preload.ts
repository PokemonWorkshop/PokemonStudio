// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ipcRenderer, contextBridge, webFrame, IpcRendererEvent } from 'electron';
import type { BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress } from '@utils/BackendTask';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { SavingData, SavingConfig, SavingText, SavingImage, ProjectStudioAction } from '@utils/SavingUtils';
import type { StudioShortcut } from '@utils/useShortcuts';
import type { ProjectFileType } from './backendTasks/chooseProjectFileToOpen';
import type { ConfigureNewProjectMetaData } from './backendTasks/configureNewProject';
import type { ShowMessageBoxTranslation } from './backendTasks/copyFile';
import type { ProjectConfigsFromBackEnd } from './backendTasks/readProjectConfigs';
import type { ProjectDataFromBackEnd } from './backendTasks/readProjectData';
import type { ProjectText } from './GlobalStateProvider';

contextBridge.exposeInMainWorld('api', {
  clearCache: () => webFrame.clearCache(),
  md5: (value) => ipcRenderer.sendSync('get-md5-hash', value),
  shortcut: {
    on: (cb) => {
      const func = (_event, args) => cb(args);
      ipcRenderer.on('request-shortcut', func);
      return func;
    },
    removeListener: (cb) => ipcRenderer.removeListener('request-shortcut', cb),
  },
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximizeMode: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  safeClose: (shouldForceQuit: boolean) => ipcRenderer.send('window-safe-close', shouldForceQuit),
  requestClose: {
    on: (cb) => ipcRenderer.on('request-window-close', cb),
    removeListener: (cb) => ipcRenderer.removeListener('request-window-close', cb),
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPSDKBinariesPath: () => ipcRenderer.invoke('get-psdk-binaries-path'),
  getPSDKVersion: () => ipcRenderer.invoke('get-psdk-version'),
  getLastPSDKVersion: () =>
    new Promise((resolve) => {
      ipcRenderer.once('get-last-psdk-version/result', (_, result) => resolve(result));
      ipcRenderer.send('get-last-psdk-version');
    }),
  updatePSDK: (currentVersion, onStatusUpdate, onDone) => {
    ipcRenderer.on('update-psdk/status', (_, ...args) => onStatusUpdate(...args));
    ipcRenderer.once('update-psdk/done', (_, success) => {
      ipcRenderer.removeAllListeners('update-psdk/status');
      onDone(success);
    });
    ipcRenderer.send('update-psdk', currentVersion);
  },
  unregisterPSDKUpdateEvents: () => {
    ipcRenderer.removeAllListeners('update-psdk/status');
    ipcRenderer.removeAllListeners('update-psdk/done');
  },
  startPSDK: (projectPath: string) => {
    ipcRenderer.send('start-psdk', projectPath);
  },
  startPSDKDebug: (projectPath: string) => {
    ipcRenderer.send('start-psdk-debug', projectPath);
  },
  startPSDKTags: (projectPath: string) => {
    ipcRenderer.send('start-psdk-tags', projectPath);
  },
  startPSDKWorldmap: (projectPath: string) => {
    ipcRenderer.send('start-psdk-worldmap', projectPath);
  },
  platform: process.platform,
  getStudioVersion: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`get-studio-version/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`get-studio-version/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`get-studio-version/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`get-studio-version/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('get-studio-version', taskPayload);
  },
  cleanupGetStudioVersion: () => {
    ipcRenderer.removeAllListeners(`get-studio-version/success`);
    ipcRenderer.removeAllListeners(`get-studio-version/failure`);
  },
  chooseProjectFileToOpen: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`choose-project-file-to-open/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`choose-project-file-to-open/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`choose-project-file-to-open/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`choose-project-file-to-open/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('choose-project-file-to-open', taskPayload);
  },
  cleanupChooseProjectFileToOpen: () => {
    ipcRenderer.removeAllListeners(`choose-project-file-to-open/success`);
    ipcRenderer.removeAllListeners(`choose-project-file-to-open/failure`);
  },
  getProjectInfo: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`get-project-info/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`get-project-info/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`get-project-info/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`get-project-info/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('get-project-info', taskPayload);
  },
  cleanupGetProjectInfo: () => {
    ipcRenderer.removeAllListeners(`get-project-info/success`);
    ipcRenderer.removeAllListeners(`get-project-info/failure`);
  },
  writeProjectMetadata: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`write-project-metadata/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`write-project-metadata/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`write-project-metadata/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`write-project-metadata/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('write-project-metadata', taskPayload);
  },
  cleanupWriteProjectMetadata: () => {
    ipcRenderer.removeAllListeners(`write-project-metadata/success`);
    ipcRenderer.removeAllListeners(`write-project-metadata/failure`);
  },
  readProjectMetadata: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`read-project-metadata/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`read-project-metadata/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`read-project-metadata/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`read-project-metadata/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('read-project-metadata', taskPayload);
  },
  cleanupReadProjectMetadata: () => {
    ipcRenderer.removeAllListeners(`read-project-metadata/success`);
    ipcRenderer.removeAllListeners(`read-project-metadata/failure`);
  },
  readProjectConfigs: (taskPayload, onSuccess, onFailure, onProgress) => {
    // Register success event
    ipcRenderer.once(`read-project-configs/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`read-project-configs/failure`);
      ipcRenderer.removeAllListeners(`read-project-configs/progress`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`read-project-configs/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`read-project-configs/success`);
      ipcRenderer.removeAllListeners(`read-project-configs/progress`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`read-project-configs/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send('read-project-configs', taskPayload);
  },
  cleanupReadProjectConfigs: () => {
    ipcRenderer.removeAllListeners(`read-project-configs/success`);
    ipcRenderer.removeAllListeners(`read-project-configs/failure`);
    ipcRenderer.removeAllListeners(`read-project-configs/progress`);
  },
  readProjectData: (taskPayload, onSuccess, onFailure, onProgress) => {
    // Register success event
    ipcRenderer.once(`read-project-data/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`read-project-data/failure`);
      ipcRenderer.removeAllListeners(`read-project-data/progress`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`read-project-data/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`read-project-data/success`);
      ipcRenderer.removeAllListeners(`read-project-data/progress`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`read-project-data/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send('read-project-data', taskPayload);
  },
  cleanupReadProjectData: () => {
    ipcRenderer.removeAllListeners(`read-project-data/success`);
    ipcRenderer.removeAllListeners(`read-project-data/failure`);
    ipcRenderer.removeAllListeners(`read-project-data/progress`);
  },
  readProjectTexts: (taskPayload, onSuccess, onFailure, onProgress) => {
    // Register success event
    ipcRenderer.once(`read-project-texts/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`read-project-texts/failure`);
      ipcRenderer.removeAllListeners(`read-project-texts/progress`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`read-project-texts/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`read-project-texts/success`);
      ipcRenderer.removeAllListeners(`read-project-texts/progress`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`read-project-texts/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send('read-project-texts', taskPayload);
  },
  cleanupReadProjectTexts: () => {
    ipcRenderer.removeAllListeners(`read-project-texts/success`);
    ipcRenderer.removeAllListeners(`read-project-texts/failure`);
    ipcRenderer.removeAllListeners(`read-project-texts/progress`);
  },
  migrateData: (taskPayload, onSuccess, onFailure, onProgress) => {
    // Register success event
    ipcRenderer.once(`migrate-data/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`migrate-data/failure`);
      ipcRenderer.removeAllListeners(`migrate-data/progress`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`migrate-data/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`migrate-data/success`);
      ipcRenderer.removeAllListeners(`migrate-data/progress`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`migrate-data/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send('migrate-data', taskPayload);
  },
  cleanupMigrateData: () => {
    ipcRenderer.removeAllListeners(`migrate-data/success`);
    ipcRenderer.removeAllListeners(`migrate-data/failure`);
    ipcRenderer.removeAllListeners(`migrate-data/progress`);
  },
  fileExists: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`file-exists/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`file-exists/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`file-exists/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`file-exists/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('file-exists', taskPayload);
  },
  cleanupFileExists: () => {
    ipcRenderer.removeAllListeners(`file-exists/success`);
    ipcRenderer.removeAllListeners(`file-exists/failure`);
  },
  updateMapInfos: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`update-map-infos/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`update-map-infos/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`update-map-infos/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`update-map-infos/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('update-map-infos', taskPayload);
  },
  cleanupUpdateMapInfos: () => {
    ipcRenderer.removeAllListeners(`update-map-infos/success`);
    ipcRenderer.removeAllListeners(`update-map-infos/failure`);
  },
  chooseFolder: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`choose-folder/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`choose-folder/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`choose-folder/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`choose-folder/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('choose-folder', taskPayload);
  },
  cleanupChooseFolder: () => {
    ipcRenderer.removeAllListeners(`choose-folder/success`);
    ipcRenderer.removeAllListeners(`choose-folder/failure`);
  },
  extractNewProject: (taskPayload, onSuccess, onFailure, onProgress) => {
    // Register success event
    ipcRenderer.once(`extract-new-project/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`extract-new-project/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`extract-new-project/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`extract-new-project/success`);
      onFailure(error);
    });
    // Register progress event
    if (onProgress) ipcRenderer.on(`extract-new-project/progress`, (_, payload) => onProgress(payload));
    // Call service
    ipcRenderer.send('extract-new-project', taskPayload);
  },
  cleanupExtractNewProject: () => {
    ipcRenderer.removeAllListeners(`extract-new-project/success`);
    ipcRenderer.removeAllListeners(`extract-new-project/failure`);
    ipcRenderer.removeAllListeners(`extract-new-project/progress`);
  },
  configureNewProject: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`configure-new-project/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`configure-new-project/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`configure-new-project/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`configure-new-project/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('configure-new-project', taskPayload);
  },
  cleanupConfigureNewProject: () => {
    ipcRenderer.removeAllListeners(`configure-new-project/success`);
    ipcRenderer.removeAllListeners(`configure-new-project/failure`);
  },
  saveProjectData: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`save-project-data/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`save-project-data/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`save-project-data/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`save-project-data/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('save-project-data', taskPayload);
  },
  cleanupSaveProjectData: () => {
    ipcRenderer.removeAllListeners(`save-project-data/success`);
    ipcRenderer.removeAllListeners(`save-project-data/failure`);
  },
  saveProjectConfigs: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`save-project-configs/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`save-project-configs/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`save-project-configs/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`save-project-configs/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('save-project-configs', taskPayload);
  },
  cleanupSaveProjectConfigs: () => {
    ipcRenderer.removeAllListeners(`save-project-configs/success`);
    ipcRenderer.removeAllListeners(`save-project-configs/failure`);
  },
  saveProjectTexts: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`save-project-texts/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`save-project-texts/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`save-project-texts/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`save-project-texts/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('save-project-texts', taskPayload);
  },
  cleanupSaveProjectTexts: () => {
    ipcRenderer.removeAllListeners(`save-project-texts/success`);
    ipcRenderer.removeAllListeners(`save-project-texts/failure`);
  },
  moveImage: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`move-image/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`move-image/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`move-image/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`move-image/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('move-image', taskPayload);
  },
  cleanupMoveImage: () => {
    ipcRenderer.removeAllListeners(`move-image/success`);
    ipcRenderer.removeAllListeners(`move-image/failure`);
  },
  projectStudioFile: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`project-studio-file/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`project-studio-file/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`project-studio-file/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`project-studio-file/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('project-studio-file', taskPayload);
  },
  cleanupProjectStudioFile: () => {
    ipcRenderer.removeAllListeners(`project-studio-file/success`);
    ipcRenderer.removeAllListeners(`project-studio-file/failure`);
  },
  chooseFile: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`choose-file/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`choose-file/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`choose-file/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`choose-file/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('choose-file', taskPayload);
  },
  cleanupChooseFile: () => {
    ipcRenderer.removeAllListeners(`choose-file/success`);
    ipcRenderer.removeAllListeners(`choose-file/failure`);
  },
  showItemInFolder: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`show-item-folder/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`show-item-folder/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`show-item-folder/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`show-item-folder/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('show-item-folder', taskPayload);
  },
  cleanupShowItemInFolder: () => {
    ipcRenderer.removeAllListeners(`show-item-folder/success`);
    ipcRenderer.removeAllListeners(`show-item-folder/failure`);
  },
  copyFile: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`copy-file/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`copy-file/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`copy-file/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`copy-file/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('copy-file', taskPayload);
  },
  cleanupCopyFile: () => {
    ipcRenderer.removeAllListeners(`copy-file/success`);
    ipcRenderer.removeAllListeners(`copy-file/failure`);
  },
  openStudioLogsFolder: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`open-studio-logs-folder/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`open-studio-logs-folder/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`open-studio-logs-folder/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`open-studio-logs-folder/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('open-studio-logs-folder', taskPayload);
  },
  cleanupOpenStudioLogsFolder: () => {
    ipcRenderer.removeAllListeners(`open-studio-logs-folder/success`);
    ipcRenderer.removeAllListeners(`open-studio-logs-folder/failure`);
  },
  updateTextInfos: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`update-text-infos/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`update-text-infos/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`update-text-infos/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`update-text-infos/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('update-text-infos', taskPayload);
  },
  cleanupUpdateTextInfos: () => {
    ipcRenderer.removeAllListeners(`update-text-infos/success`);
    ipcRenderer.removeAllListeners(`update-text-infos/failure`);
  },
  saveTextInfos: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`save-text-infos/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`save-text-infos/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`save-text-infos/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`save-text-infos/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('save-text-infos', taskPayload);
  },
  cleanupSaveTextInfos: () => {
    ipcRenderer.removeAllListeners(`save-text-infos/success`);
    ipcRenderer.removeAllListeners(`save-text-infos/failure`);
  },
  readCsvFile: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`read-csv-file/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`read-csv-file/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`read-csv-file/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`read-csv-file/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('read-csv-file', taskPayload);
  },
  cleanupReadCsvFile: () => {
    ipcRenderer.removeAllListeners(`read-csv-file/success`);
    ipcRenderer.removeAllListeners(`read-csv-file/failure`);
  },
});

declare global {
  interface Window {
    api: {
      clearCache: () => void;
      md5: (value: string) => string;
      shortcut: {
        on: (cb: (shortcut: StudioShortcut) => unknown) => (event: IpcRendererEvent, args: unknown) => void;
        removeListener: (listener: (event: IpcRendererEvent, args: unknown) => void) => void;
      };
      getAppVersion: () => Promise<string>;
      getPSDKBinariesPath: () => Promise<string>;
      getPSDKVersion: () => Promise<PSDKVersion>;
      getLastPSDKVersion: () => Promise<PSDKVersion>;
      requestClose: {
        on: (cb: Parameters<typeof ipcRenderer.on>[1]) => ReturnType<typeof ipcRenderer.on>;
        removeListener: (cb: Parameters<typeof ipcRenderer.on>[1]) => void;
      };
      minimize: () => void;
      toggleMaximizeMode: () => void;
      close: () => void;
      safeClose: (shouldForceQuit: boolean) => void;
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
      writeProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string; metaData: string }, Record<string, never>>;
      cleanupWriteProjectMetadata: () => void;
      readProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<{ path: string }, { metaData: string }>;
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
      showItemInFolder: BackendTaskWithGenericErrorAndNoProgress<{ filePath: string; extensions?: string[] }, Record<string, never>>;
      cleanupShowItemInFolder: () => void;
      copyFile: BackendTaskWithGenericErrorAndNoProgress<
        { srcFile: string; destFile: string; translation: ShowMessageBoxTranslation },
        Record<string, never>
      >;
      cleanupCopyFile: () => void;
      openStudioLogsFolder: BackendTaskWithGenericErrorAndNoProgress<Record<string, never>, Record<string, never>>;
      cleanupOpenStudioLogsFolder: () => void;
      updateTextInfos: BackendTaskWithGenericErrorAndNoProgress<{ projectPath: string; currentLanguage: string }, Record<string, never>>;
      cleanupUpdateTextInfos: () => void;
      saveTextInfos: BackendTaskWithGenericErrorAndNoProgress<{ projectPath: string; textInfos: string }, Record<string, never>>;
      cleanupSaveTextInfos: () => void;
      readCsvFile: BackendTaskWithGenericError<{ filePath: string; fileId: number }, ProjectText, GenericBackendProgress>;
      cleanupReadCsvFile: () => void;
    };
  }
}
