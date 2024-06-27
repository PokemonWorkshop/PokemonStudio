/**
 * @file WindowManager.ts
 * @description Manages creation, handling, and retrieval of Electron BrowserWindows.
 * @author Ota
 */

import { BrowserWindow, BrowserWindowConstructorOptions, app, ipcMain } from 'electron';

interface WindowInfo {
  id: number;
  name: string;
  window: BrowserWindow;
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
    // Handle window-minimize event
    ipcMain.on('window-minimize', (event) => {
      this.minimizeWindow(event.sender);
    });

    // Handle window-is-maximized event
    ipcMain.handle('window-is-maximized', (event) => {
      return this.isWindowMaximized(event.sender);
    });

    // Handle window-close event
    ipcMain.on('window-close', (event) => {
      this.requestWindowClose(event.sender);
    });

    // Handle window-safe-close event
    ipcMain.on('window-safe-close', (event, forceQuit: boolean) => {
      this.safeCloseWindow(event.sender, forceQuit);
    });

    // Handle window-maximize event
    ipcMain.on('window-maximize', (event) => {
      this.toggleMaximizeWindow(event.sender);
    });

    // Handle window-restore event
    ipcMain.on('window-restore', (event) => {
      this.restoreWindow(event.sender);
    });
  }

  /**
   * Centralizes the logic for managing window actions like minimize, maximize, restore.
   *
   * @param sender - The WebContents sending the action request.
   * @param action - The action to perform ('minimize', 'maximize', 'restore').
   */
  private manageWindowAction(sender: Electron.WebContents, action: 'minimize' | 'maximize' | 'restore'): void {
    const window = this.getWindowFromSender(sender);
    if (window) {
      switch (action) {
        case 'minimize':
          window.minimize();
          break;
        case 'maximize':
          if (window.isMaximized()) {
            window.unmaximize();
          } else {
            window.maximize();
          }
          break;
        case 'restore':
          window.restore();
          break;
        default:
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
    const window = this.getWindowFromSender(sender);
    if (window) {
      this.windows.delete(window.id);
      window.destroy();
      if (forceQuit) {
        app?.quit();
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
    const window = this.getWindowFromSender(sender);
    return window ? window.isMaximized() : false;
  }

  /**
   * Retrieves the BrowserWindow instance associated with the given WebContents.
   *
   * @param sender - The WebContents from which to retrieve the window.
   * @returns The BrowserWindow instance if found, otherwise null.
   */
  private getWindowFromSender(sender: Electron.WebContents): BrowserWindow | null {
    try {
      const window = BrowserWindow.fromWebContents(sender);
      return window || null;
    } catch (error) {
      console.error('Failed to get window from sender:', error);
      return null;
    }
  }

  /**
   * Creates a new BrowserWindow instance with the specified options.
   * Loads a URL or local file into the window if provided in the options.
   * If the window is named 'main', registers a handler to close all windows when it is closed.
   *
   * @param options - Options to configure the new BrowserWindow instance.
   * @returns The newly created BrowserWindow instance.
   */
  createWindow(
    options: Omit<BrowserWindowConstructorOptions, 'name'> & { name: string; isMain?: boolean; url?: string; file?: string }
  ): BrowserWindow {
    if (!options.name) {
      throw new Error("The 'name' property is required.");
    }

    if (this.getWindowByName(options.name)) {
      throw new Error(`Window with name '${options.name}' already exists.`);
    }

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
      },
    };

    const windowOptions = { ...defaultOptions, ...options };
    const newWindow = new BrowserWindow(windowOptions);
    const windowInfo: WindowInfo = { id: newWindow.id, name: windowOptions.name, window: newWindow };

    if (windowOptions.url) {
      newWindow.loadURL(windowOptions.url);
    } else if (windowOptions.file) {
      newWindow.loadFile(windowOptions.file);
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

    return newWindow;
  }

  /**
   * Closes all open BrowserWindow instances managed by the WindowManager.
   */
  closeAllWindows(): void {
    this.windows.forEach((windowInfo) => {
      windowInfo.window.close();
    });
  }

  /**
   * Retrieves all open BrowserWindow instances and their names managed by the WindowManager.
   *
   * @returns An array of objects containing BrowserWindow instances and their names.
   */
  getAllWindows(): { window: BrowserWindow; name: string }[] {
    return Array.from(this.windows.values()).map(({ window, name }) => ({ window, name }));
  }

  /**
   * Retrieves the main BrowserWindow instance, if set.
   *
   * @returns The main BrowserWindow instance if set and exists, otherwise undefined.
   */
  getMainWindow(): BrowserWindow | undefined {
    if (this.mainWindowId && this.windows.has(this.mainWindowId)) {
      return this.windows.get(this.mainWindowId)?.window || undefined;
    }
    return undefined;
  }

  /**
   * Sets the main BrowserWindow instance ID.
   *
   * @param mainWindowId - The ID of the main BrowserWindow instance.
   */
  setMainWindow(mainWindowId: number): void {
    this.mainWindowId = mainWindowId;
  }

  /**
   * Retrieves a BrowserWindow instance by its ID.
   *
   * @param id - The ID of the BrowserWindow instance to retrieve.
   * @returns The BrowserWindow instance if found, otherwise null.
   */
  getWindowById(id: number): BrowserWindow | null {
    return this.windows.get(id)?.window || null;
  }

  /**
   * Retrieves a BrowserWindow instance by its name.
   *
   * @param name - The name of the BrowserWindow instance to retrieve.
   * @returns The BrowserWindow instance if found, otherwise null.
   */
  getWindowByName(name: string): BrowserWindow | null {
    const windowInfo = Array.from(this.windows.values()).find((info) => info.name === name);
    return windowInfo ? windowInfo.window : null;
  }
}

// Export the singleton instance of WindowManager
export default WindowManager.getInstance();
