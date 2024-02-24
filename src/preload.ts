// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ipcRenderer, contextBridge, webFrame, IpcRendererEvent } from 'electron';
import { BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress, defineBackendTask } from '@utils/BackendTask';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { StudioShortcut } from '@utils/useShortcuts';
import type { ChooseProjectFileToOpenInput } from './backendTasks/chooseProjectFileToOpen';
import type { ConfigureNewProjectInput } from './backendTasks/configureNewProject';
import type { CopyFileInput } from './backendTasks/copyFile';
import type { ProjectConfigsFromBackEnd, ReadProjectConfigsInput } from './backendTasks/readProjectConfigs';
import type { ProjectDataFromBackEnd, ReadProjectDataInput } from './backendTasks/readProjectData';
import type { CheckMapModifiedInput, CheckMapModifiedOutput } from './backendTasks/checkMapsModified';
import type { ProjectText } from './GlobalStateProvider';
import type { LogRendererType } from '@utils/logRenderer';
import * as logRenderer from '@utils/logRenderer';
import type { SaveTextInfosInput } from './backendTasks/saveTextInfos';
import type { ReadCsvFileInput } from './backendTasks/readCsvFile';
import type { UpdateTextInfosInput } from './backendTasks/updateTextInfos';
import type { ShowItemInFolderInput } from './backendTasks/showFileInFolder';
import type { ChooseFileInput, ChooseFileOutput } from './backendTasks/chooseFile';
import type { ProjectStudioFileInput, ProjectStudioFileOutput } from './backendTasks/projectStudioFile';
import type { SaveProjectTextsInput } from './backendTasks/saveProjectTexts';
import type { SaveProjectConfigInput } from './backendTasks/saveProjectConfigs';
import type { ExtractNewProjectInput } from './backendTasks/extractNewProject';
import type { MigrateDataInput, MigrateDataOutput } from './backendTasks/migrateData';
import type { ReadProjectTextInput } from './backendTasks/readProjectTexts';
import type { ReadProjectMetadataInput, ReadProjectMetadataOutput } from './backendTasks/readProjectMetadata';
import type { WriteProjectMetadataInput } from './backendTasks/writeProjectMetadata';
import type { GetStudioVersionOutput } from './backendTasks/getStudioVersion';
import type { ConvertTMXInput } from './backendTasks/convertTiledMapToTileMetadata';
import type { SaveMapInfoInput } from './backendTasks/saveMapInfo';
import type { StartupStudioFileOutput } from './backendTasks/startupStudioFile';
import type { GetFilePathsFromFolderInput, GetFilePathsFromFolderOutput } from './backendTasks/getFilePathsFromFolder';
import type { CopyTiledFilesInput, CopyTiledFilesOutput } from './backendTasks/copyTiledFiles';
import type { RMXP2StudioMapsSyncInput } from './backendTasks/RMXP2StudioMapsSync';
import type { ReadRMXPMapInfoInput, ReadRMXPMapInfoOutput } from './backendTasks/readRMXPMapInfo';
import type { ReadRMXPMapInput, ReadRMXPMapOutput } from './backendTasks/readRMXPMap';
import type { SaveRMXPMapInfoInput } from './backendTasks/saveRMXPMapInfo';
import type { OpenTiledPayload } from './backendTasks/openTiled';
import type { DownloadFileInput } from './backendTasks/downloadFile';
import type { RequestJsonInput, RequestJsonOutput } from './backendTasks/requestJson';
import type { CheckDownloadNewProjectInput, CheckDownloadNewProjectOutput } from './backendTasks/checkDownloadNewProject';

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
  log: logRenderer,
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximizeMode: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  safeClose: (shouldForceQuit: boolean) => ipcRenderer.send('window-safe-close', shouldForceQuit),
  requestClose: {
    on: (cb) => ipcRenderer.on('request-window-close', cb),
    removeListener: (cb) => ipcRenderer.removeListener('request-window-close', cb),
  },
  requestUpdateAvailable: {
    on: (listener) => ipcRenderer.on('request-update-available', listener),
    removeListener: (listener) => ipcRenderer.removeListener('request-update-available', listener),
  },
  requestUpdateDownloaded: {
    on: (listener) => ipcRenderer.on('request-update-downloaded', listener),
    removeListener: (listener) => ipcRenderer.removeListener('request-update-downloaded', listener),
  },
  checkUpdate: () => ipcRenderer.send('studio-check-update'),
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
  getStudioVersion: defineBackendTask(ipcRenderer, 'get-studio-version'),
  chooseProjectFileToOpen: defineBackendTask(ipcRenderer, 'choose-project-file-to-open'),
  writeProjectMetadata: defineBackendTask(ipcRenderer, 'write-project-metadata'),
  readProjectMetadata: defineBackendTask(ipcRenderer, 'read-project-metadata'),
  readProjectConfigs: defineBackendTask(ipcRenderer, 'read-project-configs'),
  readProjectData: defineBackendTask(ipcRenderer, 'read-project-data'),
  readProjectTexts: defineBackendTask(ipcRenderer, 'read-project-texts'),
  migrateData: defineBackendTask(ipcRenderer, 'migrate-data'),
  fileExists: defineBackendTask(ipcRenderer, 'file-exists'),
  chooseFolder: defineBackendTask(ipcRenderer, 'choose-folder'),
  extractNewProject: defineBackendTask(ipcRenderer, 'extract-new-project'),
  configureNewProject: defineBackendTask(ipcRenderer, 'configure-new-project'),
  saveProjectData: defineBackendTask(ipcRenderer, 'save-project-data'),
  saveProjectConfigs: defineBackendTask(ipcRenderer, 'save-project-configs'),
  saveProjectTexts: defineBackendTask(ipcRenderer, 'save-project-texts'),
  projectStudioFile: defineBackendTask(ipcRenderer, 'project-studio-file'),
  chooseFile: defineBackendTask(ipcRenderer, 'choose-file'),
  showItemInFolder: defineBackendTask(ipcRenderer, 'show-item-folder'),
  copyFile: defineBackendTask(ipcRenderer, 'copy-file'),
  openStudioLogsFolder: defineBackendTask(ipcRenderer, 'open-studio-logs-folder'),
  updateTextInfos: defineBackendTask(ipcRenderer, 'update-text-infos'),
  saveTextInfos: defineBackendTask(ipcRenderer, 'save-text-infos'),
  readCsvFile: defineBackendTask(ipcRenderer, 'read-csv-file'),
  checkMapsModified: defineBackendTask(ipcRenderer, 'check-maps-modified'),
  convertTiledMapToTileMetadata: defineBackendTask(ipcRenderer, 'convertTiledMapToTileMetadata'),
  saveMapInfo: defineBackendTask(ipcRenderer, 'save-map-info'),
  startupStudioFile: defineBackendTask(ipcRenderer, 'startup-studio-file'),
  getFilePathsFromFolder: defineBackendTask(ipcRenderer, 'get-file-paths-from-folder'),
  copyTiledFiles: defineBackendTask(ipcRenderer, 'copy-tiled-files'),
  RMXP2StudioMapsSync: defineBackendTask(ipcRenderer, 'rmxp-to-studio-maps-sync'),
  readRMXPMapInfo: defineBackendTask(ipcRenderer, 'read-rmxp-map-info'),
  readRMXPMap: defineBackendTask(ipcRenderer, 'read-rmxp-map'),
  readMaps: defineBackendTask(ipcRenderer, 'read-maps'),
  saveRMXPMapInfo: defineBackendTask(ipcRenderer, 'save-rmxp-map-info'),
  openTiled: defineBackendTask(ipcRenderer, 'open-tiled'),
  downloadFile: defineBackendTask(ipcRenderer, 'download-file'),
  requestJson: defineBackendTask(ipcRenderer, 'request-json'),
  checkDownloadNewProject: defineBackendTask(ipcRenderer, 'check-download-new-project'),
});

type AnyObj = Record<string, never>;

declare global {
  interface Window {
    api: {
      clearCache: () => void;
      md5: (value: string) => string;
      shortcut: {
        on: (cb: (shortcut: StudioShortcut) => unknown) => (event: IpcRendererEvent, args: unknown) => void;
        removeListener: (listener: (event: IpcRendererEvent, args: unknown) => void) => void;
      };
      log: LogRendererType;
      getAppVersion: () => Promise<string>;
      getPSDKBinariesPath: () => Promise<string>;
      getPSDKVersion: () => Promise<PSDKVersion>;
      getLastPSDKVersion: () => Promise<PSDKVersion>;
      requestClose: {
        on: (cb: Parameters<typeof ipcRenderer.on>[1]) => ReturnType<typeof ipcRenderer.on>;
        removeListener: (cb: Parameters<typeof ipcRenderer.on>[1]) => void;
      };
      requestUpdateAvailable: {
        on: (cb: Parameters<typeof ipcRenderer.on>[1]) => ReturnType<typeof ipcRenderer.on>;
        removeListener: (cb: Parameters<typeof ipcRenderer.on>[1]) => void;
      };
      requestUpdateDownloaded: {
        on: (cb: Parameters<typeof ipcRenderer.on>[1]) => ReturnType<typeof ipcRenderer.on>;
        removeListener: (cb: Parameters<typeof ipcRenderer.on>[1]) => void;
      };
      checkUpdate: () => void;
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
      getStudioVersion: BackendTaskWithGenericErrorAndNoProgress<AnyObj, GetStudioVersionOutput>;
      chooseProjectFileToOpen: BackendTaskWithGenericErrorAndNoProgress<ChooseProjectFileToOpenInput, ChooseProjectFileToOpenOutput>;
      writeProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<WriteProjectMetadataInput, AnyObj>;
      readProjectMetadata: BackendTaskWithGenericErrorAndNoProgress<ReadProjectMetadataInput, ReadProjectMetadataOutput>;
      readProjectConfigs: BackendTaskWithGenericError<ReadProjectConfigsInput, ProjectConfigsFromBackEnd, GenericBackendProgress>;
      readProjectData: BackendTaskWithGenericError<ReadProjectDataInput, ProjectDataFromBackEnd, GenericBackendProgress>;
      readProjectTexts: BackendTaskWithGenericError<ReadProjectTextInput, ProjectText, GenericBackendProgress>;
      migrateData: BackendTaskWithGenericError<MigrateDataInput, MigrateDataOutput, GenericBackendProgress>;
      fileExists: BackendTaskWithGenericErrorAndNoProgress<FileExistsInput, FileExistsOutput>;
      chooseFolder: BackendTaskWithGenericErrorAndNoProgress<AnyObj, ChooseFolderOutput>;
      extractNewProject: BackendTaskWithGenericError<ExtractNewProjectInput, AnyObj, GenericBackendProgress>;
      configureNewProject: BackendTaskWithGenericErrorAndNoProgress<ConfigureNewProjectInput, AnyObj>;
      saveProjectData: BackendTaskWithGenericErrorAndNoProgress<SaveProjectDataInput, AnyObj>;
      saveProjectConfigs: BackendTaskWithGenericErrorAndNoProgress<SaveProjectConfigInput, AnyObj>;
      saveProjectTexts: BackendTaskWithGenericErrorAndNoProgress<SaveProjectTextsInput, AnyObj>;
      projectStudioFile: BackendTaskWithGenericErrorAndNoProgress<ProjectStudioFileInput, ProjectStudioFileOutput>;
      chooseFile: BackendTaskWithGenericErrorAndNoProgress<ChooseFileInput, ChooseFileOutput>;
      showItemInFolder: BackendTaskWithGenericErrorAndNoProgress<ShowItemInFolderInput, AnyObj>;
      copyFile: BackendTaskWithGenericErrorAndNoProgress<CopyFileInput, AnyObj>;
      openStudioLogsFolder: BackendTaskWithGenericErrorAndNoProgress<AnyObj, AnyObj>;
      updateTextInfos: BackendTaskWithGenericErrorAndNoProgress<UpdateTextInfosInput, AnyObj>;
      saveTextInfos: BackendTaskWithGenericErrorAndNoProgress<SaveTextInfosInput, AnyObj>;
      readCsvFile: BackendTaskWithGenericError<ReadCsvFileInput, ProjectText, GenericBackendProgress>;
      checkMapsModified: BackendTaskWithGenericErrorAndNoProgress<CheckMapModifiedInput, CheckMapModifiedOutput>;
      convertTiledMapToTileMetadata: BackendTaskWithGenericErrorAndNoProgress<ConvertTMXInput, ConvertTMXOutput>;
      saveMapInfo: BackendTaskWithGenericErrorAndNoProgress<SaveMapInfoInput, AnyObj>;
      startupStudioFile: BackendTaskWithGenericErrorAndNoProgress<AnyObj, StartupStudioFileOutput>;
      getFilePathsFromFolder: BackendTaskWithGenericErrorAndNoProgress<GetFilePathsFromFolderInput, GetFilePathsFromFolderOutput>;
      copyTiledFiles: BackendTaskWithGenericErrorAndNoProgress<CopyTiledFilesInput, CopyTiledFilesOutput>;
      RMXP2StudioMapsSync: BackendTaskWithGenericErrorAndNoProgress<RMXP2StudioMapsSyncInput, AnyObj>;
      readRMXPMapInfo: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPMapInfoInput, ReadRMXPMapInfoOutput>;
      readRMXPMap: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPMapInput, ReadRMXPMapOutput>;
      readMaps: BackendTaskWithGenericErrorAndNoProgress<ReadMapsInput, ReadMapsOutput>;
      saveRMXPMapInfo: BackendTaskWithGenericErrorAndNoProgress<SaveRMXPMapInfoInput, AnyObj>;
      openTiled: BackendTaskWithGenericErrorAndNoProgress<OpenTiledPayload, AnyObj>;
      downloadFile: BackendTaskWithGenericError<DownloadFileInput, AnyObj, GenericBackendProgress>;
      requestJson: BackendTaskWithGenericErrorAndNoProgress<RequestJsonInput, RequestJsonOutput>;
      checkDownloadNewProject: BackendTaskWithGenericErrorAndNoProgress<CheckDownloadNewProjectInput, CheckDownloadNewProjectOutput>;
    };
  }
}
