'use strict';

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import addon from '../driver';
import path from 'path';
import { RazerDeviceManager } from './razerdevicemanager';
import { createMenuFor } from './menu/menubuilder';
import { saveSettingsFor } from './settingsmanager';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';

const APP_VERSION = require('../../package.json').version;

const isDevelopment = process.env.NODE_ENV == 'development';

const razerApp = {
  addon: addon,
  deviceManager: new RazerDeviceManager(path.join(__dirname, '../devices')),
  tray: null,
  window: null,
  forceQuit: null,
  refreshTray: refreshTray,
  spectrumAnimation: null,
  cycleAnimation: null,
};
razerApp.init = function() {
  const spectrumPromise = new RazerAnimationCycleSpectrum(razerApp).init().then(animation => {
    this.spectrumAnimation = animation;
  });
  const cyclePromise = new RazerAnimationCycleCustom(razerApp).init().then(animation => {
    this.cycleAnimation = animation;
  });
  return Promise.all([spectrumPromise, cyclePromise]);
};

let mainMenu = [
  {
    label: 'Refresh Device List',
    click() {
      refreshTray(true);
    },
  },
  { type: 'separator' },
  {
    label: 'None All Devices',
    click() {
      razerApp.deviceManager.activeRazerDevices.forEach(device => {
        device.setModeNone();
      });
    },
  },
  {
    label: 'Color All Devices',
    submenu: [
      {
        label: 'Red',
        click() {
          razerApp.deviceManager.activeRazerDevices.forEach(device => {
            device.setModeStaticNoStore(new Uint8Array([0xff, 0, 0]));
          });
        },
      },
      {
        label: 'Green',
        click() {
          razerApp.deviceManager.activeRazerDevices.forEach(device => {
            device.setModeStaticNoStore(new Uint8Array([0, 0xff, 0]));
          });
        },
      },
      {
        label: 'Blue',
        click() {
          razerApp.deviceManager.activeRazerDevices.forEach(device => {
            device.setModeStaticNoStore(new Uint8Array([0, 0, 0xff]));
          });
        },
      },
    ],
  },
  {
    label: 'Spectrum All Devices',
    click() {
      razerApp.spectrumAnimation.start();
    },
  },
  {
    label: 'Cycle All Devices',
  },
];

function buildCustomColorsCycleMenu() {
  let cccMenu = [
    {
      label: 'Cycle All Devices',
      click() {
        razerApp.cycleAnimation.start();
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        razerApp.cycleAnimation.addColor({ r: 0x00, g: 0xff, b: 0x00 });
        refreshTray();
      },
    },
    {
      label: 'Reset Colors',
      click() {
        razerApp.cycleAnimation.setColor([
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ]);
        refreshTray();
      },
    },
    { type: 'separator' },
  ];

  const colorItems = razerApp.cycleAnimation.getAllColors().map((color, index) => {
    return {
      label: 'Color ' + (index + 1),
      click: () => {
        // TODO Own color picker without dependency to a device??
        // razerApp.window.webContents.send('device-selected', {
        //   currentColor: {
        //     hex: rgbToHex(color),
        //     rgb: color,
        //   },
        // });
        // razerApp.window.show();
      },
    };
  });
  cccMenu = cccMenu.concat(colorItems);
  mainMenu[5].submenu = cccMenu;
}

const mainMenuBottom = [
  { type: 'separator' },
  {
    label: 'About',
    submenu: [
      {
        label: `Version: ${APP_VERSION}`,
        enabled: false,
      },
    ],
  },
  {
    label: 'Quit',
    click() {
      app.quit();
    },
  },
];

app.on('ready', () => {
  createTray();
  createWindow();
});

app.on('quit', () => {
  razerApp.deviceManager.closeDevices(razerApp.addon);
});

nativeTheme.on('updated', () => {
  createTray();
});

// mouse dpi rpc listener
ipcMain.on('request-set-dpi', (event, arg) => {
  const { device } = arg;
  const currentDevice = razerApp.deviceManager.getByInternalId(device.internalId);
  currentDevice.settings = device.settings;
  razerApp.addon.mouseSetDpi(currentDevice.internalId, currentDevice.settings.customSensitivity);
  refreshTray();
});

// keyboard brightness rpc listener
ipcMain.on('update-keyboard-brightness', (_, arg) => {
  const { device } = arg;
  const currentDevice = razerApp.deviceManager.getByInternalId(device.internalId);
  currentDevice.settings = device.settings;
  saveSettingsFor(currentDevice);
  currentDevice.setBrightness(currentDevice.settings.customBrightness);
  refreshTray();
});

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { device } = arg;
  const currentDevice = razerApp.deviceManager.getByInternalId(device.internalId);
  currentDevice.settings = device.settings;
  saveSettingsFor(currentDevice);
  refreshTray();
});
ipcMain.on('request-set-custom-color2', (event, arg) => {
  const { device } = arg;
  const currentDevice = razerApp.deviceManager.getByInternalId(device.internalId);
  currentDevice.settings = device.settings;
  saveSettingsFor(currentDevice);
  refreshTray();
});


function createWindow() {
  razerApp.window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 450, // This is adjusted later with window.setSize
    resizable: false,
    width: 500,
    y: 100,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: '#202124',
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
  });
  if (isDevelopment) {
    razerApp.window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    razerApp.window.resizable = true;
  } else {
    razerApp.window.loadFile(path.join(__dirname, 'index.html'));
  }
  razerApp.window.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    razerApp.window.on('close', function(e) {
      if (!razerApp.forceQuit) {
        e.preventDefault();
        razerApp.window.hide();
      }
    });

    app.on('activate', () => {
      razerApp.window.show();
    });

    app.on('before-quit', () => {
      razerApp.forceQuit = true;
    });

    if (isDevelopment) {
      // auto-open dev tools
      razerApp.window.webContents.openDevTools();

      // add inspect element on right click menu
      razerApp.window.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              razerApp.window.inspectElement(props.x, props.y);
            },
          },
        ]).popup(razerApp.window);
      });
    }
  });
}

function createTray() {
  if (!isDevelopment) {
    if (app.dock) app.dock.hide();

    if (razerApp.tray != null) {
      razerApp.tray.destroy();
    }
  }

  // *Template.png will be automatically inverted by electron: https://www.electronjs.org/docs/api/native-image#template-image
  razerApp.tray = new Tray(path.join(__static, '/assets/iconTemplate.png'));
  razerApp.tray.setToolTip('Razer macOS menu');

  refreshTray(true);
}

function refreshTray(withDeviceRefresh) {
  const refresh = withDeviceRefresh ? razerApp.deviceManager.refreshRazerDevices(razerApp.addon).then(() => {
    return razerApp.init();
  }) : Promise.resolve(true);
  refresh.then(() => {
    buildCustomColorsCycleMenu();

    const deviceMenus = razerApp.deviceManager.activeRazerDevices.map(device => createMenuFor(razerApp, device)).flat();

    const menu = mainMenu.concat(deviceMenus).concat(mainMenuBottom);
    patch(menu);
    const contextMenu = Menu.buildFromTemplate(menu);
    razerApp.tray.setContextMenu(contextMenu);
  });
}

function patch(deviceMenu) {
  deviceMenu.forEach(menuItem => {
    if (menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        razerApp.spectrumAnimation.stop();
        razerApp.cycleAnimation.stop();
        originalClick(ev);
      };
    } else if (menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu']);
    }
  });
}
