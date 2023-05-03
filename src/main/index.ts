/* eslint global-require: off, no-console: off */

import crypto from 'crypto';
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import MenuBuilder from './menu';
import { getPSDKBinariesPath, getPSDKVersion } from '../services/getPSDKVersion';
import { getLastPSDKVersion } from '../services/getLastPSDKVersion';
import { updatePSDK } from '../services/updatePSDK';
import { startPSDK, startPSDKDebug, startPSDKTags, startPSDKWorldmap } from '../services/startPSDK';
import { registerElectronProtocolWhenAppRead } from '../utils/electronProtocol';
import { registergetStudioVersion } from '../backendTasks/getStudioVersion';
import { registerChooseProjectFileToOpen } from '../backendTasks/chooseProjectFileToOpen';
import { registerGetProjectInfo } from '../backendTasks/getProjectInfo';
import { registerWriteProjectMetadata } from '../backendTasks/writeProjectMetadata';
import { registerReadProjectMetadata } from '../backendTasks/readProjectMetadata';
import { registerReadProjectConfigs } from '../backendTasks/readProjectConfigs';
import { registerReadProjectData } from '../backendTasks/readProjectData';
import { registerReadProjectTexts } from '../backendTasks/readProjectTexts';
import { registerMigrateData } from '../backendTasks/migrateData';
import { registerFileExists } from '../backendTasks/fileExists';
import { registerUpdateMapInfos } from '../backendTasks/updateMapInfos';
import { registerChooseFolder } from '../backendTasks/chooseFolder';
import { registerExtractNewProject } from '../backendTasks/extractNewProject';
import { registerConfigureNewProject } from '../backendTasks/configureNewProject';
import { registerSaveProjectData } from '../backendTasks/saveProjectData';
import { registerSaveProjectConfigs } from '../backendTasks/saveProjectConfigs';
import { registerSaveProjectTexts } from '../backendTasks/saveProjectTexts';
import { registerMoveImage } from '../backendTasks/moveImage';
import { registerProjectStudioFile } from '../backendTasks/projectStudioFile';
import { registerChooseFile } from '../backendTasks/chooseFile';
import { registerShowItemInFolder } from '../backendTasks/showFileInFolder';
import { registerCopyFile } from '../backendTasks/copyFile';
import { registerUpdateTextInfos } from '@src/backendTasks/updateTextInfos';
import { registerSaveTextInfos } from '@src/backendTasks/saveTextInfos';
import { registerReadCsvFile } from '@src/backendTasks/readCsvFile';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
export default class AppUpdater {
  constructor() {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => console.info('Failed to check for update', err));
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  registerElectronProtocolWhenAppRead(RESOURCES_PATH);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 640,
    useContentSize: true,
    icon: getAssetPath('icon.png'),
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      if (process.platform === 'win32') mainWindow.maximize();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', (event) => {
    mainWindow?.webContents.send('request-window-close');
    event.preventDefault();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', (event) => {
  const wins = BrowserWindow.getAllWindows();
  if (wins.length) {
    wins.forEach((win) => win.webContents.send('request-window-close'));
    event.preventDefault();
  }
});

ipcMain.on('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;
  if (window.isMaximized()) window.unmaximize();
  else window.maximize();
});

ipcMain.on('window-close', (event) => {
  event.sender.send('request-window-close');
});

ipcMain.on('window-safe-close', (event, forceQuit) => {
  BrowserWindow.fromWebContents(event.sender)?.destroy();
  if (forceQuit) app?.quit();
});

ipcMain.on('window-is-maximized', (event) => {
  event.returnValue = BrowserWindow.fromWebContents(event.sender)?.isMaximized();
});

ipcMain.handle('get-psdk-binaries-path', () => getPSDKBinariesPath());
ipcMain.handle('get-psdk-version', () => getPSDKVersion());
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('get-last-psdk-version', getLastPSDKVersion);
ipcMain.on('update-psdk', updatePSDK);
ipcMain.on('start-psdk', (_, projectPath: string) => startPSDK(projectPath));
ipcMain.on('start-psdk-debug', (_, projectPath: string) => startPSDKDebug(projectPath));
ipcMain.on('start-psdk-tags', (_, projectPath: string) => startPSDKTags(projectPath));
ipcMain.on('start-psdk-worldmap', (_, projectPath: string) => startPSDKWorldmap(projectPath));
registergetStudioVersion(ipcMain);
registerChooseProjectFileToOpen(ipcMain);
registerGetProjectInfo(ipcMain);
registerWriteProjectMetadata(ipcMain);
registerReadProjectMetadata(ipcMain);
registerReadProjectConfigs(ipcMain);
registerReadProjectData(ipcMain);
registerReadProjectTexts(ipcMain);
registerReadCsvFile(ipcMain);
registerMigrateData(ipcMain);
registerFileExists(ipcMain);
registerUpdateMapInfos(ipcMain);
registerChooseFolder(ipcMain);
registerExtractNewProject(ipcMain);
registerConfigureNewProject(ipcMain);
registerSaveProjectData(ipcMain);
registerSaveProjectConfigs(ipcMain);
registerSaveProjectTexts(ipcMain);
registerMoveImage(ipcMain);
registerProjectStudioFile(ipcMain);
registerChooseFile(ipcMain);
registerShowItemInFolder(ipcMain);
registerCopyFile(ipcMain);
registerUpdateTextInfos(ipcMain);
registerSaveTextInfos(ipcMain);

ipcMain.on('get-md5-hash', (event, value: string) => (event.returnValue = crypto.createHash('md5').update(value, 'utf8').digest().toString('hex')));
app.whenReady().then(createWindow).catch(console.error);
