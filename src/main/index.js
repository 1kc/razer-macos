'use strict';

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import addon from '../driver';
import path from 'path';
import { getAllRazerDeviceConfigurations } from './razerdevices';
import { getSettingsFor, saveSettingsFor } from './settingsmanager';
import { getSpectrumAnimation } from './animation/spectrumanimation';
import { getCycleAnimation } from './animation/cycleanimation';
import { createMenuFor } from './menu/menubuilder';
import { RazerDevice } from './device/razerdevice';
import { RazerDeviceKeyboard } from './device/razerdevicekeyboard';
import { RazerDeviceMouse } from './device/razerdevicemouse';
import { RazerDeviceMouseDock } from './device/razerdevicemousedock';
import { RazerDeviceMouseMat } from './device/razerdevicemousemat';
import { RazerDeviceEgpu } from './device/razerdeviceegpu';
import { RazerDeviceHeadphone } from './device/razerdeviceheadphone';
import { RazerDeviceAccessory } from './device/razerdeviceaccessory';

const APP_VERSION = require('../../package.json').version;

const isDevelopment = process.env.NODE_ENV == 'development';

const razerApp = {
  addon: addon,
  allRazerDeviceConfigurations: getAllRazerDeviceConfigurations(path.join(__dirname, '../devices')),
  spectrumAnimation: null,
  cycleAnimation: null,
  activeRazerDevices: null,
};
razerApp.init = function(activeRazerDevices) {
  this.activeRazerDevices = activeRazerDevices;

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

function getActiveRazerDevices() {
  const devicePromises = razerApp.addon.getAllDevices()
    .map(async foundDevice => {
      const configurationDevice = razerApp.allRazerDeviceConfigurations.find(d => d.productId === foundDevice.productId);
      if (configurationDevice === undefined) {
        return null;
      }
      const razerProperties = {
        name: configurationDevice.name,
        productId: foundDevice.productId,
        internalId: foundDevice.internalDeviceId,
        mainType: configurationDevice.mainType,
        features: configurationDevice.features,
      };
      const razerDevice = createRazerDeviceFrom(razerProperties);
      return razerDevice.init(razerApp.addon);
    });
  return Promise.all(devicePromises, devices => {
    return devices.filter(device => device !== null);
  });
}

function createRazerDeviceFrom(razerProperties) {
  switch (razerProperties.mainType) {
    case 'keyboard':
      return new RazerDeviceKeyboard(razerProperties);
    case 'mouse':
      return new RazerDeviceMouse(razerProperties);
    case 'mousedock':
      return new RazerDeviceMouseDock(razerProperties);
    case 'mousemat':
      return new RazerDeviceMouseMat(razerProperties);
    case 'egpu':
      return new RazerDeviceEgpu(razerProperties);
    case 'headphone':
      return new RazerDeviceHeadphone(razerProperties);
    case 'accessory':
      return new RazerDeviceAccessory(razerProperties);
    default:
      return new RazerDevice(razerProperties);
  }
}

let mainMenu = [
  {
    label: 'Refresh Device List',
    click() {
      refreshDevices();
      refreshTray();
    },
  },
  { type: 'separator' },
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
  mainMenu[3].submenu = cccMenu;
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
  if (razerApp.activeRazerDevices != null) {
    razerApp.addon.closeAllDevices();
  }
  return getActiveRazerDevices().then(allDevices => {
    razerApp.activeRazerDevices = allDevices;
  });
};

app.on('ready', () => {
  getActiveRazerDevices().then(activeDevices => {
    return razerApp.init(activeDevices);
  }).then(() => {
    createTray();
    createWindow();
  });
});

app.on('quit', () => {
  razerApp.addon.closeAllDevices();
});

nativeTheme.on('updated', () => {
  createTray();
});

// mouse dpi rpc listener
ipcMain.on('request-set-dpi', (event, arg) => {
  const { device } = arg;
  razerApp.addon.mouseSetDpi(device.settings.customSensitivity);
});

// keyboard brightness rpc listener
ipcMain.on('update-keyboard-brightness', (_, arg) => {
  const { device } = arg;
  saveSettingsFor(device);
  razerApp.addon.KbdSetBrightness(device.settings.customBrightness);
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
  buildCustomColorsCycleMenu();
  const deviceMenus = razerApp.activeRazerDevices.map(device => createMenuFor(device)).flat();

  //patch click events to stop animation before every click TODO: recursive

  const menu = mainMenu.concat(deviceMenus).concat(mainMenuBottom);
  const contextMenu = Menu.buildFromTemplate(menu);
  tray.setToolTip('Razer macOS menu');
  tray.setContextMenu(contextMenu);
}
