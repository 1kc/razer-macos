'use strict';

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import addon from '../driver';
import path from 'path';
import { RazerDeviceManager } from './razerdevicemanager';
import { getSpectrumAnimation } from './animation/spectrumanimation';
import { getCycleAnimation } from './animation/cycleanimation';
import { createMenuFor } from './menu/menubuilder';
import { saveSettingsFor } from './settingsmanager';

const APP_VERSION = require('../../package.json').version;

const isDevelopment = process.env.NODE_ENV == 'development';

const razerApp = {
  addon: addon,
  deviceManager: new RazerDeviceManager(path.join(__dirname, '../devices')),
  refreshTray: refreshTray,
  spectrumAnimation: null,
  cycleAnimation: null,
};
razerApp.init = function() {
  const spectrumPromise = getSpectrumAnimation(razerApp).then(animation => {
    this.spectrumAnimation = animation;
  });
  const cyclePromise = getCycleAnimation(razerApp).then(animation => {
    this.cycleAnimation = animation;
  });
  return Promise.all([spectrumPromise, cyclePromise]);
};

let tray = null;
let window = null;
let forceQuit = false;


let mainMenu = [
  {
    label: 'Refresh Device List',
    click() {
      refreshTray();
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
        // window.webContents.send('device-selected', {
        //   currentColor: {
        //     hex: rgbToHex(color),
        //     rgb: color,
        //   },
        // });
        // window.show();
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

const refreshDevices = () => {
  return razerApp.deviceManager.refreshRazerDevices(razerApp.addon);
};

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
  razerApp.addon.mouseSetDpi(device.internalId, device.settings.customSensitivity);
});

// keyboard brightness rpc listener
ipcMain.on('update-keyboard-brightness', (_, arg) => {
  const { device } = arg;
  saveSettingsFor(device);
  device.setBrightness(device.settings.customBrightness);
  refreshTray();
});

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { device } = arg;
  saveSettingsFor(device);
});
ipcMain.on('request-set-custom-color2', (event, arg) => {
  const { device } = arg;
  saveSettingsFor(device);
});


function createWindow() {
  window = new BrowserWindow({
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
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    window.resizable = true;
  } else {
    window.loadFile(path.join(__dirname, 'index.html'));
  }
  window.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    window.on('close', function(e) {
      if (!forceQuit) {
        e.preventDefault();
        window.hide();
      }
    });

    app.on('activate', () => {
      window.show();
    });

    app.on('before-quit', () => {
      forceQuit = true;
    });

    if (isDevelopment) {
      // auto-open dev tools
      window.webContents.openDevTools();

      // add inspect element on right click menu
      window.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              window.inspectElement(props.x, props.y);
            },
          },
        ]).popup(window);
      });
    }
  });
}

function createTray() {
  if (!isDevelopment) {
    if (app.dock) app.dock.hide();

    if (tray != null) {
      tray.destroy();
    }
  }

  // *Template.png will be automatically inverted by electron: https://www.electronjs.org/docs/api/native-image#template-image
  tray = new Tray(path.join(__static, '/assets/iconTemplate.png'));

  refreshTray();
}

function refreshTray() {
  razerApp.deviceManager.refreshRazerDevices(razerApp.addon).then(() => {
    return razerApp.init();
  }).then(() => {
    buildCustomColorsCycleMenu();

    const deviceMenus = razerApp.deviceManager.activeRazerDevices.map(device => createMenuFor(razerApp, device)).flat();

    const menu = mainMenu.concat(deviceMenus).concat(mainMenuBottom);
    patch(menu);
    const contextMenu = Menu.buildFromTemplate(menu);
    tray.setToolTip('Razer macOS menu');
    tray.setContextMenu(contextMenu);
  });
}

function patch(deviceMenu) {
  deviceMenu.forEach(menuItem => {
    if(menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        console.log('stop animations');
        razerApp.spectrumAnimation.stop();
        razerApp.cycleAnimation.stop();
        originalClick(ev);
      }
    } else if(menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu']);
    }
  })
}
