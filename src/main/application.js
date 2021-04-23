import { RazerApplication } from './razerapplication';
import { app, dialog, BrowserWindow, ipcMain, Menu, nativeTheme, Tray, powerMonitor } from 'electron';
import path from 'path';
import { getMenuFor } from './menu/menubuilder';

const version = require('../../package.json').version;

/**
 * Application is a small wrapper around an electron app (browserwindow, tray, dialog...)
 * It's the entry point into the application and references the main functionality with: RazerApplication
 * @constructor
 */
export class Application {

  constructor(isDevelopment) {
    this.isDevelopment = isDevelopment;
    this.forceQuit = false;
    this.tray = null;
    this.browserWindow = null;
    this.app = app;
    this.dialog = dialog;
    this.APP_VERSION = version;

    this.initListeners();

    // Init the main application
    this.razerApplication = new RazerApplication();
  }

  initListeners() {
    this.app.on('ready', () => {
      this.createTray();
      this.createWindow();
    });

    this.app.on('quit', () => {
      this.razerApplication.destroy();
    });

    nativeTheme.on('updated', () => {
      this.createTray();
    });

    powerMonitor.on('suspend', () => {
      if(this.razerApplication.stateManager.stateOnSuspend == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.suspend();
      });
    });
    powerMonitor.on('resume', () => {
      if(this.razerApplication.stateManager.stateOnResume == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.resume();
      });
    });
    powerMonitor.on('on-ac', () => {
      if(this.razerApplication.stateManager.stateOnAc == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.onAc();
      });
    });
    powerMonitor.on('on-battery', () => {
      if(this.razerApplication.stateManager.stateOnBattery == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.onBattery();
      });
    });
    powerMonitor.on('shutdown', () => {
      if(this.razerApplication.stateManager.stateOnShutdown == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.shutdown();
      });
    });
    powerMonitor.on('lock-screen', () => {
      if(this.razerApplication.stateManager.stateOnLockScreen == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.lockScreen();
      });
    });
    powerMonitor.on('unlock-screen', () => {
      if(this.razerApplication.stateManager.stateOnUnlockScreen == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.unlockScreen();
      });
    });
    powerMonitor.on('user-did-become-active', () => {
      if(this.razerApplication.stateManager.stateOnUserDidBecomeActive == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.userDidBecomeActive();
      });
    });
    powerMonitor.on('user-did-resign-active', () => {
      if(this.razerApplication.stateManager.stateOnUserDidResignActive == null) {
        return;
      }
      this.razerApplication.refresh(false).then(() => {
        return this.razerApplication.stateManager.userDidResignActive();
      });
    });

    // mouse dpi rpc listener
    ipcMain.on('request-set-dpi', (_, arg) => {
      const { device } = arg;
      const currentDevice = this.razerApplication.deviceManager.getByInternalId(device.internalId);
      currentDevice.setSettings(device.settings);
      currentDevice.setDPI(currentDevice.settings.customSensitivity);
      this.refreshTray();
    });

    // keyboard brightness rpc listener
    ipcMain.on('update-brightness', (_, arg) => {
      const { device, brightness } = arg;
      const currentDevice = this.razerApplication.deviceManager.getByInternalId(device.internalId);
      currentDevice.setBrightness(brightness);
      this.refreshTray();
    });

    // custom color rpc listener
    ipcMain.on('request-set-custom-color', (_, arg) => {
      const { device } = arg;
      const currentDevice = this.razerApplication.deviceManager.getByInternalId(device.internalId);
      currentDevice.setSettings(device.settings);
      this.refreshTray();
    });

    // custom cycle color rpc listener
    ipcMain.on('request-cycle-color', (_, arg) => {
      const { index, color } = arg;
      this.razerApplication.cycleAnimation.updateColor(index, color.rgb);
      this.refreshTray();
    });

    // mouse brightness
    ['Logo', 'Scroll', 'Left', 'Right'].forEach(brightnessMouseIdentifier => {
      ipcMain.on('update-mouse-' + brightnessMouseIdentifier.toLowerCase() + '-brightness', (_, arg) => {
        const { device, brightness } = arg;
        const currentDevice = this.razerApplication.deviceManager.getByInternalId(device.internalId);
        currentDevice['setBrightness' + brightnessMouseIdentifier](brightness);
        this.refreshTray();
      });
    });

    // poll rate
    ipcMain.on('update-mouse-pollrate', (_, arg) => {
      const { device, pollRate } = arg;
      const currentDevice = this.razerApplication.deviceManager.getByInternalId(device.internalId);
      currentDevice.setPollRate(pollRate);
    });

    //state manager
    ipcMain.on('state-settings-add', async (event, stateName) => {
      event.returnValue = await this.razerApplication.stateManager.addState(stateName);
    });
    ipcMain.on('state-settings-remove', (event, stateName) => {
      this.razerApplication.stateManager.removeState(stateName);
    });
    ipcMain.on('state-settings-activate', (event, stateName) => {
      this.razerApplication.stateManager.activateState(stateName);
    });

    ipcMain.on('state-settings-start', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnStart = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-suspend', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnSuspend = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-resume', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnResume = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-ac', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnAc = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-battery', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnBattery = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-shutdown', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnShutdown = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-lockscreen', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnLockScreen = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-unlockscreen', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnUnlockScreen = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-userdidbecomeactive', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnUserDidBecomeActive = stateValue;
      this.razerApplication.stateManager.save();
    });
    ipcMain.on('state-settings-userdidresignactive', (event, stateValue) => {
      this.razerApplication.stateManager.stateOnUserDidResignActive = stateValue;
      this.razerApplication.stateManager.save();
    });
  }


  createWindow() {
    this.browserWindow = new BrowserWindow({
      webPreferences: { nodeIntegration: true },
      //titleBarStyle: 'hidden',
      height: 800, // This is adjusted later with window.setSize
      resizable: false,
      width: 500,
      minWidth: 320,
      minHeight: 320,
      y: 100,
      // Set the default background color of the window to match the CSS
      // background color of the page, this prevents any white flickering
      backgroundColor: '#202124',
      // Don't show the window until it's ready, this prevents any white flickering
      show: false,
    });
    if (this.isDevelopment) {
      this.browserWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
      this.browserWindow.resizable = true;
    } else {
      this.browserWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    this.browserWindow.on('close', (e) => {
      if (!this.forceQuit) {
        e.preventDefault();
        this.browserWindow.hide();
      }
    });

    this.app.on('activate', () => {
      this.browserWindow.show();
    });

    this.app.on('before-quit', () => {
      this.forceQuit = true;
    });

    if (this.isDevelopment) {
      // auto-open dev tools
      //this.browserWindow.webContents.openDevTools();

      // add inspect element on right click menu
      this.browserWindow.webContents.on('context-menu', (e, props) => {
        const that = this;
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              that.browserWindow.inspectElement(props.x, props.y);
            },
          },
        ]).popup(this.browserWindow);
      });
    }
  }

  createTray() {
    if (!this.isDevelopment) {
      if (this.app.dock) {
        this.app.dock.hide();
      }

      if (this.tray != null) {
        this.tray.destroy();
      }
    }

    // Template.png will be automatically inverted by electron: https://www.electronjs.org/docs/api/native-image#template-image
    this.tray = new Tray(path.join(__static, '/assets/iconTemplate.png'));
    this.tray.setToolTip('Razer macOS menu');

    this.refreshTray(true);
  }

  refreshTray(withDeviceRefresh) {
    const refresh = withDeviceRefresh ? this.razerApplication.refresh() : Promise.resolve(true);
    refresh.then(() => {
      const contextMenu = Menu.buildFromTemplate(getMenuFor(this));
      this.tray.setContextMenu(contextMenu);
    });
  }

  showConfirm(message) {
    this.app.focus();
    return this.dialog.showMessageBox({
      buttons: ['Yes', 'No'], message: message,
    });
  }

  showView(args) {
    this.browserWindow.webContents.send('render-view', args);
    this.browserWindow.show();
  }

  quit() {
    this.app.quit();
  }
}