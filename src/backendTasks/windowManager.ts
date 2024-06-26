import { BrowserWindow, BrowserWindowConstructorOptions, app, ipcMain } from 'electron';

type IPCEventType = 'on' | 'once' | 'handle' | 'removeListener' | 'removeAllListeners';

/**
 * Manages creation, manipulation, and event handling of BrowserWindow instances.
 * This class provides methods to create, access, and control windows within an Electron application.
 *
 * @author Ota
 */
class WindowManager {
  static instance: WindowManager;
  private windows: Map<number, BrowserWindow> = new Map(); // Map to store BrowserWindow instances
  private mainWindowId: number | null; // ID of the main window, if set

  public static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * Creates an instance of WindowManager.
   * Initializes an empty map for windows and sets the main window ID to null.
   */
  constructor() {
    this.mainWindowId = null;
    this.setupIPCEventHandlers(); // Setup IPC event handlers for window management
  }

  /**
   * Sets up IPC event handlers for window management.
   * Registers handlers for minimize, maximize, restore, close, and safe-close events.
   */
  private setupIPCEventHandlers(): void {
    ipcMain.on('window-minimize', (event) => {
      this.minimizeWindow(event.sender);
    });

    ipcMain.handle('window-is-maximized', (event) => {
      return this.isWindowMaximized(event.sender);
    });

    ipcMain.on('window-close', (event) => {
      this.requestWindowClose(event.sender);
    });

    ipcMain.on('window-safe-close', (event, forceQuit: boolean) => {
      this.safeCloseWindow(event.sender, forceQuit);
    });

    ipcMain.on('window-maximize', (event) => {
      this.toggleMaximizeWindow(event.sender);
    });

    ipcMain.on('window-restore', (event) => {
      this.restoreWindow(event.sender);
    });
  }

  /**
   * Minimizes the BrowserWindow associated with the given WebContents.
   * If the window does not exist, logs an error message.
   *
   * @param sender - The WebContents sending the minimize request.
   */
  private minimizeWindow(sender: Electron.WebContents): void {
    const window = this.getWindowFromSender(sender);
    if (window) {
      window.minimize();
    } else {
      console.error('Attempted to minimize a window that does not exist.');
    }
  }

  /**
   * Toggles the maximize/restore state of the BrowserWindow associated with the given WebContents.
   * If the window does not exist, no action is taken.
   *
   * @param sender - The WebContents sending the maximize/restore request.
   */
  private toggleMaximizeWindow(sender: Electron.WebContents): void {
    const window = this.getWindowFromSender(sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
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
   * Restores the BrowserWindow associated with the given WebContents to its normal state.
   *
   * @param sender - The WebContents sending the restore request.
   */
  private restoreWindow(sender: Electron.WebContents): void {
    const window = this.getWindowFromSender(sender);
    if (window) {
      window.restore();
    }
  }

  /**
   * Creates a new BrowserWindow instance with the specified options.
   * Loads a URL or local file into the window if provided in the options.
   *
   * @param options - Options to configure the new BrowserWindow instance.
   * @returns The newly created BrowserWindow instance.
   */
  createWindow(options: BrowserWindowConstructorOptions & { url?: string; file?: string }): BrowserWindow {
    const defaultOptions: BrowserWindowConstructorOptions = {
      show: false,
      width: 1280,
      height: 720,
      minWidth: 960,
      minHeight: 640,
      titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
      autoHideMenuBar: process.platform === 'linux',
      webPreferences: {
        contextIsolation: true,
      },
    };

    const windowOptions = { ...defaultOptions, ...options };
    const newWindow = new BrowserWindow(windowOptions);

    if (windowOptions.url) {
      newWindow.loadURL(windowOptions.url);
    } else if (windowOptions.file) {
      newWindow.loadFile(windowOptions.file);
    }

    this.windows.set(newWindow.id, newWindow);

    newWindow.on('closed', () => {
      this.windows.delete(newWindow.id);
    });

    return newWindow;
  }

  /**
   * Retrieves all open BrowserWindow instances managed by the WindowManager.
   *
   * @returns An array of all open BrowserWindow instances.
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * Retrieves the main BrowserWindow instance, if set.
   *
   * @returns The main BrowserWindow instance if set and exists, otherwise null.
   */
  getMainWindow(): BrowserWindow | null {
    if (this.mainWindowId && this.windows.has(this.mainWindowId)) {
      return this.windows.get(this.mainWindowId) || null;
    }
    return null;
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
    return this.windows.get(id) || null;
  }
}

export default WindowManager.getInstance();
