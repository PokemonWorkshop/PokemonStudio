import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions, MenuItem } from 'electron';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  isDarwin: boolean;

  isDev: boolean;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.isDarwin = process.platform === 'darwin';
    this.isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
  }

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    this.mainWindow.setMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: 'Pokémon Studio',
        submenu: [
          {
            label: 'About Pokémon Studio',
            role: 'about',
          },
          { type: 'separator' },
          { label: 'Services', submenu: [] },
          { type: 'separator' },
          {
            label: 'Hide Pokémon Studio',
            accelerator: 'CmdOrCtrl+H',
            role: this.isDarwin ? 'hide' : 'minimize',
          },
          {
            label: 'Hide Others',
            visible: this.isDarwin,
            accelerator: 'Cmd+Shift+H',
            role: 'hideOthers',
          },
          {
            label: 'Show All',
            visible: this.isDarwin,
            role: 'unhide',
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Meta+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        role: 'editMenu',
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Previous Database item',
            accelerator: this.isDarwin ? 'Alt+Left' : 'Ctrl+Left',
            click: () => this.mainWindow.webContents.send('request-shortcut', 'db_previous'),
          },
          {
            label: 'Next Database item',
            accelerator: this.isDarwin ? 'Alt+Right' : 'Ctrl+Right',
            click: () => this.mainWindow.webContents.send('request-shortcut', 'db_next'),
          },
          {
            label: 'Reload',
            visible: this.isDev,
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: 'Toggle Full Screen',
            accelerator: this.isDarwin ? 'Ctrl+Command+F' : 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
          {
            label: 'Toggle Developer Tools',
            visible: this.isDev,
            accelerator: 'CmdOrCtrl+Alt+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: 'Window',
        role: 'windowMenu',
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click() {
              shell.openExternal('https://psdk.pokemonworkshop.com/yard/');
            },
          },
          {
            label: 'Getting started',
            click() {
              shell.openExternal('https://psdk.pokemonworkshop.fr/wiki/en/index.html');
            },
          },
          {
            label: 'Discord',
            click() {
              shell.openExternal('https://discord.com/invite/0noB0gBDd91B8pMk');
            },
          },
          {
            label: 'Twitter',
            click() {
              shell.openExternal('https://twitter.com/pokemonworkshop');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
