/**
 * @file WindowManager.ts
 * @description Manages creation, handling, and retrieval of Electron BrowserWindows.
 * @version 0.0.2
 * @author @Otaku17
 */

import { BrowserWindow, BrowserWindowConstructorOptions, IpcMainEvent, IpcMainInvokeEvent, app, ipcMain } from 'electron';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const mainWindowWebpackEntry = MAIN_WINDOW_WEBPACK_ENTRY;
const mainWindowPreloadWebpackEntry = MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY;

/**
 * TypeScript union type to allow both number and string
 */
type WindowIdentifier = number | string;

/**
 * Interface for storing information about a window.
 */
interface WindowInfo {
  id: number;
  name: string;
  window: BrowserWindow;
  events: { [key: string]: (...args: unknown[]) => void };
}

/**
 * WindowManager class manages the lifecycle and interactions of Electron BrowserWindows.
 * It provides methods for window creation, retrieval, and event handling.
 */
class WindowManager {
  static instance: WindowManager;
  private windows: Map<number, WindowInfo> = new Map();
  private mainWindowId: number | null;

  /**
   * Singleton instance method.
   * Ensures only one instance of WindowManager exists.
   *
   * @returns The singleton instance of WindowManager.
   */
  public static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * Constructor for WindowManager.
   * Initializes the main window ID and sets up IPC event handlers.
   */
  private constructor() {
    this.mainWindowId = null;
    this.setupIPCEventHandlers();
  }

  /**
   * Setup IPC event handlers for window actions.
   * Handles minimize, maximize, close, safe-close, and restore events.
   */
  private setupIPCEventHandlers(): void {
    ipcMain.on('window-minimize', (event: IpcMainEvent) => this.minimizeWindow(event.sender));
    ipcMain.handle('window-is-maximized', (event: IpcMainInvokeEvent) => this.isWindowMaximized(event.sender));
    ipcMain.on('window-close', (event: IpcMainEvent) => this.requestWindowClose(event.sender));
    ipcMain.on('window-safe-close', (event: IpcMainEvent, forceQuit: boolean) => this.safeCloseWindow(event.sender, forceQuit));
    ipcMain.on('window-maximize', (event: IpcMainEvent) => this.toggleMaximizeWindow(event.sender));
    ipcMain.on('window-restore', (event: IpcMainEvent) => this.restoreWindow(event.sender));
    ipcMain.on('custom-event', (_, windowIdentifier: WindowIdentifier, eventName: string, ...args: unknown[]) => {
      const windowInfo = this.getWindowInfo(windowIdentifier);
      if (windowInfo && windowInfo.events[eventName]) {
        windowInfo.events[eventName](...args);
      }
    });
  }

  /**
   * Centralizes the logic for managing window actions like minimize, maximize, restore.
   *
   * @param sender - The WebContents sending the action request.
   * @param action - The action to perform ('minimize', 'maximize', 'restore').
   */
  private manageWindowAction(sender: Electron.WebContents, action: 'minimize' | 'maximize' | 'restore'): void {
    const window = BrowserWindow.fromWebContents(sender);
    if (window) {
      switch (action) {
        case 'minimize':
          window.minimize();
          break;
        case 'maximize':
          window.isMaximized() ? window.unmaximize() : window.maximize();
          break;
        case 'restore':
          window.restore();
          break;
      }
    } else {
      console.error(`Attempted to ${action} a window that does not exist.`);
    }
  }

  /**
   * Minimizes the BrowserWindow associated with the given WebContents.
   *
   * @param sender - The WebContents sending the minimize request.
   */
  private minimizeWindow(sender: Electron.WebContents): void {
    this.manageWindowAction(sender, 'minimize');
  }

  /**
   * Toggles the maximize/restore state of the BrowserWindow associated with the given WebContents.
   *
   * @param sender - The WebContents sending the maximize/restore request.
   */
  private toggleMaximizeWindow(sender: Electron.WebContents): void {
    this.manageWindowAction(sender, 'maximize');
  }

  /**
   * Restores the BrowserWindow associated with the given WebContents to its normal state.
   *
   * @param sender - The WebContents sending the restore request.
   */
  private restoreWindow(sender: Electron.WebContents): void {
    this.manageWindowAction(sender, 'restore');
  }

  /**
   * Requests the BrowserWindow associated with the given WebContents to close.
   *
   * @param sender - The WebContents sending the close request.
   */
  private requestWindowClose(sender: Electron.WebContents): void {
    sender.send('request-window-close');
  }

  /**
   * Safely closes the BrowserWindow associated with the given WebContents.
   * Removes the window from the map and destroys it. Quits the app if forceQuit is true.
   *
   * @param sender - The WebContents sending the close request.
   * @param forceQuit - If true, quits the app after closing the window.
   */
  private safeCloseWindow(sender: Electron.WebContents, forceQuit: boolean): void {
    const window = BrowserWindow.fromWebContents(sender);
    if (window) {
      this.windows.delete(window.id);
      window.destroy();
      if (forceQuit) {
        app.quit();
      }
    }
  }

  /**
   * Checks if the BrowserWindow associated with the given WebContents is maximized.
   *
   * @param sender - The WebContents sending the request.
   * @returns True if the window is maximized, false otherwise.
   */
  private isWindowMaximized(sender: Electron.WebContents): boolean {
    const window = BrowserWindow.fromWebContents(sender);
    return window ? window.isMaximized() : false;
  }

  /**
   * Retrieves the WindowInfo object based on a window identifier (ID or name).
   *
   * @param identifier - The ID or name of the window to retrieve.
   * @returns The WindowInfo object if found, otherwise undefined.
   */
  private getWindowInfo(identifier: WindowIdentifier): WindowInfo | undefined {
    if (typeof identifier === 'number') {
      return this.windows.get(identifier);
    } else if (typeof identifier === 'string') {
      return Array.from(this.windows.values()).find((info) => info.name === identifier);
    }
    return undefined;
  }

  /**
   * Creates a new BrowserWindow instance with the specified options.
   * Loads a URL or local file into the window if provided in the options.
   * If the window is named 'main', registers a handler to close all windows when it is closed.
   *
   * @param options - Options to configure the new BrowserWindow instance.
   * @param events - Custom events associated with the new window.
   * @returns The newly created BrowserWindow instance.
   */
  public createWindow(
    options: Omit<BrowserWindowConstructorOptions, 'name'> & {
      name: string;
      isMain?: boolean;
      url?: string;
      file?: string;
    },
    events: { [key: string]: (...args: unknown[]) => void } = {}
  ): BrowserWindow {
    if (!options.name) throw new Error("The 'name' property is required.");
    if (this.getWindow(options.name)) throw new Error(`Window with name '${options.name}' already exists.`);

    const defaultOptions: BrowserWindowConstructorOptions = {
      show: false,
      width: 1280,
      height: 720,
      minWidth: 960,
      minHeight: 640,
      useContentSize: true,
      titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
      autoHideMenuBar: process.platform === 'linux',
      webPreferences: {
        contextIsolation: true,
        preload: mainWindowPreloadWebpackEntry,
      },
    };

    const windowOptions = { ...defaultOptions, ...options, webPreferences: { ...defaultOptions.webPreferences, ...options.webPreferences } };
    const newWindow = new BrowserWindow(windowOptions);
    const windowInfo: WindowInfo = { id: newWindow.id, name: windowOptions.name, window: newWindow, events };

    if (windowOptions.url) {
      newWindow.loadURL(windowOptions.url);
    } else if (windowOptions.file) {
      newWindow.loadFile(windowOptions.file);
    } else {
      newWindow.loadURL(mainWindowWebpackEntry);
    }

    if (options.isMain) {
      if (this.mainWindowId !== null) {
        newWindow.destroy();
        throw new Error('A main window already exists.');
      } else {
        this.mainWindowId = newWindow.id;
      }
    }

    this.windows.set(newWindow.id, windowInfo);

    newWindow.on('closed', () => {
      this.windows.delete(newWindow.id);
      if (windowOptions.isMain) {
        this.closeAllWindows();
      }
    });

    console.log(this.getAllWindows());

    return newWindow;
  }

  /**
   * Closes all open BrowserWindow instances managed by the WindowManager.
   */
  public closeAllWindows(): void {
    this.windows.forEach((windowInfo) => {
      windowInfo.window.close();
    });
  }

  /**
   * Retrieves all open BrowserWindow instances and their names managed by the WindowManager.
   *
   * @returns An array of objects containing BrowserWindow instances and their names.
   */
  public getAllWindows(): { window: BrowserWindow; name: string; id: number; events: object }[] {
    return Array.from(this.windows.values()).map(({ window, name, id, events }) => ({ window, name, id, events }));
  }

  /**
   * Retrieves the main BrowserWindow instance, if set.
   *
   * @returns The main BrowserWindow instance if set and exists, otherwise undefined.
   */
  public getMainWindow(): BrowserWindow | undefined {
    return this.mainWindowId ? this.getWindow(this.mainWindowId) : undefined;
  }

  /**
   * Sets the main BrowserWindow instance ID.
   *
   * @param mainWindowId - The ID of the main BrowserWindow instance.
   */
  public setMainWindow(mainWindowId: number): void {
    this.mainWindowId = mainWindowId;
  }

  /**
   * Retrieves a BrowserWindow instance by its ID or name
   *
   * @param identifier - The ID or name of the BrowserWindow instance to retrieve.
   * @returns The BrowserWindow instance if found, otherwise undefined.
   */
  public getWindow(identifier: WindowIdentifier): BrowserWindow | undefined {
    if (typeof identifier === 'number') {
      return this.windows.get(identifier)?.window;
    } else if (typeof identifier === 'string') {
      return Array.from(this.windows.values()).find((info) => info.name === identifier)?.window;
    }
    return undefined;
  }
}

// Export the singleton instance of WindowManager
export default WindowManager.getInstance();
export { mainWindowWebpackEntry, mainWindowPreloadWebpackEntry };
