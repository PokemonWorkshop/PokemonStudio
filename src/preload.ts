// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { StudioShortcut } from '@hooks/useShortcuts';
import type { PSDKVersion } from '@services/getPSDKVersion';
import { BackendTaskWithGenericError, BackendTaskWithGenericErrorAndNoProgress, GenericBackendProgress, defineBackendTask } from '@utils/BackendTask';
import type { LogRendererType } from '@utils/logRenderer';
import * as logRenderer from '@utils/logRenderer';
import { IpcRendererEvent, contextBridge, ipcRenderer, webFrame, webUtils } from 'electron';
import type { CheckDownloadNewProjectInput, CheckDownloadNewProjectOutput } from './backendTasks/checkDownloadNewProject';
import type { CheckMapModifiedInput, CheckMapModifiedOutput } from './backendTasks/checkMapsModified';
import type { ChooseFileInput, ChooseFileOutput } from './backendTasks/chooseFile';
import type { ChooseProjectFileToOpenInput } from './backendTasks/chooseProjectFileToOpen';
import type { ConfigureNewProjectInput } from './backendTasks/configureNewProject';
import type { RMXPEventsToStudioEventsInput, RMXPEventsToStudioEventsOutput } from './backendTasks/convertRMXPEventsToStudioEvents';
import type { ConvertTMXInput } from './backendTasks/convertTiledMapToTileMetadata';
import type { CopyFileInput } from './backendTasks/copyFile';
import type { CopyTiledFilesInput, CopyTiledFilesOutput } from './backendTasks/copyTiledFiles';
import type { DownloadFileInput } from './backendTasks/downloadFile';
import type { ExtractNewProjectInput } from './backendTasks/extractNewProject';
import type { FileExistsInput, FileExistsOutput } from './backendTasks/fileExists';
import type { GeneratingMapOverviewInput } from './backendTasks/generatingMapOverview';
import type { GetCompilationConfigOutput } from './backendTasks/getCompilationConfig';
import type { GetFilePathsFromFolderInput, GetFilePathsFromFolderOutput } from './backendTasks/getFilePathsFromFolder';
import type { GetStudioVersionOutput } from './backendTasks/getStudioVersion';
import type { MigrateDataInput, MigrateDataOutput } from './backendTasks/migrateData';
import type { OpenCompilationWindowInput } from './backendTasks/openCompilationWindow';
import type { OpenTiledPayload } from './backendTasks/openTiled';
import type { ProjectStudioFileInput, ProjectStudioFileOutput } from './backendTasks/projectStudioFile';
import type { ReadCsvFileInput } from './backendTasks/readCsvFile';
import type { ReadMapAndAssetsInput, ReadMapAndAssetsOutput } from './backendTasks/readMapAndAssets';
import type { ReadMapBytesInput, ReadMapBytesOutput } from './backendTasks/readMapBytes';
import type { ReadAudioBytesInput, ReadAudioBytesOutput } from './backendTasks/readAudioBytes';
import type { ProjectConfigsFromBackEnd, ReadProjectConfigsInput } from './backendTasks/readProjectConfigs';
import type { ProjectDataFromBackEnd, ReadProjectDataInput } from './backendTasks/readProjectData';
import type { ReadProjectMetadataInput, ReadProjectMetadataOutput } from './backendTasks/readProjectMetadata';
import type { ReadProjectTextInput } from './backendTasks/readProjectTexts';
import type { ReadRMXPEventInput, ReadRMXPEventOutput } from './backendTasks/readRMXPEvents';
import type { WriteRMXPEventsInput, WriteRMXPEventsOutput } from './backendTasks/writeRMXPEvents';
import type { ReadRMXPSwitchNamesInput, ReadRMXPSwitchNamesOutput } from './backendTasks/readRMXPSwitchNames';
import type { ReadRMXPCommonEventNamesInput, ReadRMXPCommonEventNamesOutput } from './backendTasks/readRMXPCommonEventNames';
import type { ChooseCharacterGraphicInput, ChooseCharacterGraphicOutput } from './backendTasks/chooseCharacterGraphic';
import type { ReadRMXPMapInput, ReadRMXPMapOutput } from './backendTasks/readRMXPMap';
import type { ReadRMXPMapInfoInput, ReadRMXPMapInfoOutput } from './backendTasks/readRMXPMapInfo';
import type { RequestJsonInput, RequestJsonOutput } from './backendTasks/requestJson';
import type { OnlineHttpRequestInput, OnlineHttpRequestOutput } from './backendTasks/onlineHttpRequest';
import type { SaveCompilationLogsInput } from './backendTasks/saveCompilationLogs';
import type { SaveEventTreeInput } from './backendTasks/saveEventTree';
import type { SaveMapInfoInput } from './backendTasks/saveMapInfo';
import type { WriteMapBytesInput, WriteMapBytesOutput } from './backendTasks/writeMapBytes';
import type { CreateTilesetFromImageInput, CreateTilesetFromImageOutput } from './backendTasks/createTilesetFromImage';
import type { ReadTilesetBytesInput, ReadTilesetBytesOutput } from './backendTasks/readTilesetBytes';
import type { WriteTilesetBytesInput, WriteTilesetBytesOutput } from './backendTasks/writeTilesetBytes';
import type { ReadTilesetImageBytesInput, ReadTilesetImageBytesOutput } from './backendTasks/readTilesetImageBytes';
import type { SaveProjectConfigInput } from './backendTasks/saveProjectConfigs';
import type { SaveProjectTextsInput } from './backendTasks/saveProjectTexts';
import type { SaveRMXPMapInfoInput } from './backendTasks/saveRMXPMapInfo';
import type { SaveTextInfosInput } from './backendTasks/saveTextInfos';
import type { ShowItemInFolderInput } from './backendTasks/showFileInFolder';
import type { StartCompilationInput, StartCompilationOutput } from './backendTasks/startCompilation';
import type { StartupStudioFileOutput } from './backendTasks/startupStudioFile';
import type { SynchronizeLanguageInput } from './backendTasks/synchronizeLanguage';
import type { UpdateTextInfosInput } from './backendTasks/updateTextInfos';
import type { WriteProjectMetadataInput } from './backendTasks/writeProjectMetadata';
import type { ProjectText } from './GlobalStateProvider';

contextBridge.exposeInMainWorld('api', {
  isDev: process.env.NODE_ENV === 'development',
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
  startPSDKWorldmap: (projectPath: string) => {
    ipcRenderer.send('start-psdk-worldmap', projectPath);
  },
  platform: process.platform,
  externalWindow: (link) => ipcRenderer.send('external-window', link),
  getPathForFile: (file) => webUtils.getPathForFile(file),
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
  readMapAndAssets: defineBackendTask(ipcRenderer, 'read-map-and-assets'),
  readMapBytes: defineBackendTask(ipcRenderer, 'read-map-bytes'),
  readAudioBytes: defineBackendTask(ipcRenderer, 'read-audio-bytes'),
  checkMapsModified: defineBackendTask(ipcRenderer, 'check-maps-modified'),
  convertTiledMapToTileMetadata: defineBackendTask(ipcRenderer, 'convertTiledMapToTileMetadata'),
  saveMapInfo: defineBackendTask(ipcRenderer, 'save-map-info'),
  writeMapBytes: defineBackendTask(ipcRenderer, 'write-map-bytes'),
  createTilesetFromImage: defineBackendTask(ipcRenderer, 'create-tileset-from-image'),
  readTilesetBytes: defineBackendTask(ipcRenderer, 'read-tileset-bytes'),
  writeTilesetBytes: defineBackendTask(ipcRenderer, 'write-tileset-bytes'),
  readTilesetImageBytes: defineBackendTask(ipcRenderer, 'read-tileset-image-bytes'),
  saveEventTree: defineBackendTask(ipcRenderer, 'save-event-tree'),
  startupStudioFile: defineBackendTask(ipcRenderer, 'startup-studio-file'),
  getFilePathsFromFolder: defineBackendTask(ipcRenderer, 'get-file-paths-from-folder'),
  copyTiledFiles: defineBackendTask(ipcRenderer, 'copy-tiled-files'),
  readRMXPMapInfo: defineBackendTask(ipcRenderer, 'read-rmxp-map-info'),
  readRMXPMap: defineBackendTask(ipcRenderer, 'read-rmxp-map'),
  saveRMXPMapInfo: defineBackendTask(ipcRenderer, 'save-rmxp-map-info'),
  readMaps: defineBackendTask(ipcRenderer, 'read-maps'),
  openTiled: defineBackendTask(ipcRenderer, 'open-tiled'),
  downloadFile: defineBackendTask(ipcRenderer, 'download-file'),
  requestJson: defineBackendTask(ipcRenderer, 'request-json'),
  onlineHttpRequest: defineBackendTask(ipcRenderer, 'online-http-request'),
  checkDownloadNewProject: defineBackendTask(ipcRenderer, 'check-download-new-project'),
  generatingMapOverview: defineBackendTask(ipcRenderer, 'generating-map-overview'),
  openCompilationWindow: defineBackendTask(ipcRenderer, 'open-compilation-window'),
  getCompilationConfig: defineBackendTask(ipcRenderer, 'get-compilation-config'),
  startCompilation: defineBackendTask(ipcRenderer, 'start-compilation'),
  saveCompilationLogs: defineBackendTask(ipcRenderer, 'save-compilation-logs'),
  synchronizeLanguage: defineBackendTask(ipcRenderer, 'synchronize-language'),
  readRMXPEvents: defineBackendTask(ipcRenderer, 'read-rmxp-events'),
  writeRMXPEvents: defineBackendTask(ipcRenderer, 'write-rmxp-events'),
  readRMXPSwitchNames: defineBackendTask(ipcRenderer, 'read-rmxp-switch-names'),
  readRMXPCommonEventNames: defineBackendTask(ipcRenderer, 'read-rmxp-common-event-names'),
  chooseCharacterGraphic: defineBackendTask(ipcRenderer, 'choose-character-graphic'),
  convertRMXPEventsToStudioEvents: defineBackendTask(ipcRenderer, 'convert-rmxp-events-to-studio-events'),
});

type AnyObj = Record<string, never>;

declare global {
  interface Window {
    api: {
      isDev: boolean;
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
        onDone: (success: boolean) => void,
      ) => void;
      unregisterPSDKUpdateEvents: () => void;
      startPSDK: (projectPath: string) => void;
      startPSDKDebug: (projectPath: string) => void;
      startPSDKWorldmap: (projectPath: string) => void;
      platform: string;
      externalWindow: (link: string) => void;
      getPathForFile: (file: File) => string;
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
      readMapAndAssets: BackendTaskWithGenericErrorAndNoProgress<ReadMapAndAssetsInput, ReadMapAndAssetsOutput>;
      readMapBytes: BackendTaskWithGenericErrorAndNoProgress<ReadMapBytesInput, ReadMapBytesOutput>;
      readAudioBytes: BackendTaskWithGenericErrorAndNoProgress<ReadAudioBytesInput, ReadAudioBytesOutput>;
      checkMapsModified: BackendTaskWithGenericErrorAndNoProgress<CheckMapModifiedInput, CheckMapModifiedOutput>;
      convertTiledMapToTileMetadata: BackendTaskWithGenericErrorAndNoProgress<ConvertTMXInput, ConvertTMXOutput>;
      saveMapInfo: BackendTaskWithGenericErrorAndNoProgress<SaveMapInfoInput, AnyObj>;
      writeMapBytes: BackendTaskWithGenericErrorAndNoProgress<WriteMapBytesInput, WriteMapBytesOutput>;
      createTilesetFromImage: BackendTaskWithGenericErrorAndNoProgress<CreateTilesetFromImageInput, CreateTilesetFromImageOutput>;
      readTilesetBytes: BackendTaskWithGenericErrorAndNoProgress<ReadTilesetBytesInput, ReadTilesetBytesOutput>;
      writeTilesetBytes: BackendTaskWithGenericErrorAndNoProgress<WriteTilesetBytesInput, WriteTilesetBytesOutput>;
      readTilesetImageBytes: BackendTaskWithGenericErrorAndNoProgress<ReadTilesetImageBytesInput, ReadTilesetImageBytesOutput>;
      saveEventTree: BackendTaskWithGenericErrorAndNoProgress<SaveEventTreeInput, AnyObj>;
      startupStudioFile: BackendTaskWithGenericErrorAndNoProgress<AnyObj, StartupStudioFileOutput>;
      getFilePathsFromFolder: BackendTaskWithGenericErrorAndNoProgress<GetFilePathsFromFolderInput, GetFilePathsFromFolderOutput>;
      copyTiledFiles: BackendTaskWithGenericErrorAndNoProgress<CopyTiledFilesInput, CopyTiledFilesOutput>;
      readRMXPMapInfo: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPMapInfoInput, ReadRMXPMapInfoOutput>;
      readRMXPMap: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPMapInput, ReadRMXPMapOutput>;
      saveRMXPMapInfo: BackendTaskWithGenericErrorAndNoProgress<SaveRMXPMapInfoInput, AnyObj>;
      readMaps: BackendTaskWithGenericErrorAndNoProgress<ReadMapsInput, ReadMapsOutput>;
      openTiled: BackendTaskWithGenericErrorAndNoProgress<OpenTiledPayload, AnyObj>;
      downloadFile: BackendTaskWithGenericError<DownloadFileInput, AnyObj, GenericBackendProgress>;
      requestJson: BackendTaskWithGenericErrorAndNoProgress<RequestJsonInput, RequestJsonOutput>;
      onlineHttpRequest: BackendTaskWithGenericErrorAndNoProgress<OnlineHttpRequestInput, OnlineHttpRequestOutput>;
      checkDownloadNewProject: BackendTaskWithGenericErrorAndNoProgress<CheckDownloadNewProjectInput, CheckDownloadNewProjectOutput>;
      generatingMapOverview: BackendTaskWithGenericErrorAndNoProgress<GeneratingMapOverviewInput, AnyObj>;
      openCompilationWindow: BackendTaskWithGenericErrorAndNoProgress<OpenCompilationWindowInput, AnyObj>;
      getCompilationConfig: BackendTaskWithGenericErrorAndNoProgress<AnyObj, GetCompilationConfigOutput>;
      startCompilation: BackendTaskWithGenericError<StartCompilationInput, StartCompilationOutput, GenericBackendProgress>;
      saveCompilationLogs: BackendTaskWithGenericErrorAndNoProgress<SaveCompilationLogsInput, AnyObj>;
      synchronizeLanguage: BackendTaskWithGenericErrorAndNoProgress<SynchronizeLanguageInput, AnyObj>;
      readRMXPEvents: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPEventInput, ReadRMXPEventOutput>;
      writeRMXPEvents: BackendTaskWithGenericErrorAndNoProgress<WriteRMXPEventsInput, WriteRMXPEventsOutput>;
      readRMXPSwitchNames: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPSwitchNamesInput, ReadRMXPSwitchNamesOutput>;
      readRMXPCommonEventNames: BackendTaskWithGenericErrorAndNoProgress<ReadRMXPCommonEventNamesInput, ReadRMXPCommonEventNamesOutput>;
      chooseCharacterGraphic: BackendTaskWithGenericErrorAndNoProgress<ChooseCharacterGraphicInput, ChooseCharacterGraphicOutput>;
      convertRMXPEventsToStudioEvents: BackendTaskWithGenericErrorAndNoProgress<RMXPEventsToStudioEventsInput, RMXPEventsToStudioEventsOutput>;
    };
  }
}
