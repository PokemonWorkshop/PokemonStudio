const { Titlebar, Color } = require('custom-electron-titlebar');
const { ipcRenderer } = window.require('electron');

window.addEventListener('DOMContentLoaded', () => {
  if (process.platform === 'darwin' || process.platform === 'linux') return;

  const titleBar = new Titlebar({
    backgroundColor: Color.fromHex('#26252c'), // dark16
    titleHorizontalAlignment: 'left',
    containerOverflow: 'hidden',
    onMinimize: () => ipcRenderer.send('window-minimize'),
    onMaximize: () => ipcRenderer.send('window-maximize'),
    onClose: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
    onMenuItemClick: () => {},
  });

  ipcRenderer.on('window-fullscreen', (event, isFullScreen) => {
    titleBar.onWindowFullScreen(isFullScreen);
  });

  ipcRenderer.on('window-focus', (event, isFocused) => {
    if (titleBar) titleBar.onWindowFocus(isFocused);
  });
});

/*contextBridge.exposeInMainWorld('api', */
window.api = {
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
  startPSDK: (projectPath) => {
    ipcRenderer.send('start-psdk', projectPath);
  },
  startPSDKDebug: (projectPath) => {
    ipcRenderer.send('start-psdk-debug', projectPath);
  },
  startPSDKTags: (projectPath) => {
    ipcRenderer.send('start-psdk-tags', projectPath);
  },
  startPSDKWorldmap: (projectPath) => {
    ipcRenderer.send('start-psdk-worldmap', projectPath);
  },
  registerProjectCreationListener: (listener) => {
    ipcRenderer.on('project-create/status', (_, ...args) => listener(...args));
  },
  unregisterProjectCreationListener: () => {
    ipcRenderer.removeAllListeners('project-create/status');
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
    ipcRenderer.once(`file-exists-v2/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`file-exists-v2/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`file-exists-v2/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`file-exists-v2/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('file-exists-v2', taskPayload);
  },
  cleanupFileExists: () => {
    ipcRenderer.removeAllListeners(`file-exists-v2/success`);
    ipcRenderer.removeAllListeners(`file-exists-v2/failure`);
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
};
