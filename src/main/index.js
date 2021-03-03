'use strict';

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain, dialog } from 'electron';
import addon from '../driver';
import path from 'path';
import { RazerDeviceManager } from './razerdevicemanager';
import { saveSettingsFor } from './settingsmanager';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';
import { getMenuFor } from './menu/menubuilder';

const APP_VERSION = require('../../package.json').version;
const isDevelopment = process.env.NODE_ENV == 'development';

const razerApp = {
  app: app,
  dialog: dialog,
  tray: null,
  window: null,
  forceQuit: null,
  refreshTray: refreshTray,

  APP_VERSION: APP_VERSION,
  addon: addon,
  deviceManager: new RazerDeviceManager(path.join(__dirname, '../devices')),
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

razerApp.app.on('ready', () => {
  createTray();
  createWindow();
});

razerApp.app.on('quit', () => {
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
  currentDevice.setDPI(currentDevice.settings.customSensitivity);
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

ipcMain.on('request-cycle-color', (_, arg) => {
  const { index, color } = arg;
  razerApp.cycleAnimation.updateColor(index, color.rgb);
  refreshTray();
});

function createWindow() {
  razerApp.window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    //titleBarStyle: 'hidden',
    height: 800, // This is adjusted later with window.setSize
    resizable: false,
    width: 500,
    minWidth:320,
    minHeight: 320,
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

    razerApp.app.on('activate', () => {
      razerApp.window.show();
    });

    razerApp.app.on('before-quit', () => {
      razerApp.forceQuit = true;
    });

    if (isDevelopment) {
      // auto-open dev tools
      //razerApp.window.webContents.openDevTools();

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
    if (razerApp.app.dock) {
      razerApp.app.dock.hide();
    }

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
    const menu = getMenuFor(razerApp);
    const contextMenu = Menu.buildFromTemplate(menu);
    razerApp.tray.setContextMenu(contextMenu);
  });
}
