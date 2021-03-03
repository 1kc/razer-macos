import { RazerDeviceManager } from './razerdevicemanager';
import { SettingsManager } from './settingsmanager';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';
import { getMenuFor } from './menu/menubuilder';
import path from 'path';

/**
 * Main application
 * DeviceManager: Queries all the devices and sets up their features
 * SettingsManager: Used to save settings for the application / devices
 *
 * Animations: Animations which are run on all devices in parallel are held here as well.
 * @constructor
 */
export class RazerApplication {
  constructor(electronApp) {
    this.electronApp = electronApp;

    this.APP_VERSION = require('../../package.json').version;
    this.settingsManager = new SettingsManager();
    this.deviceManager = new RazerDeviceManager(this.settingsManager, path.join(__dirname, '../devices'));
    this.spectrumAnimation = null;
    this.cycleAnimation = null;
  }

  initListeners(queue) {
    // mouse dpi rpc listener
    queue.on('request-set-dpi', (_, arg) => {
      const { device } = arg;
      const currentDevice = this.deviceManager.getByInternalId(device.internalId);
      currentDevice.setSettings(device.settings);
      currentDevice.setDPI(currentDevice.settings.customSensitivity);
      this.refreshTray();
    });

    // keyboard brightness rpc listener
    queue.on('update-keyboard-brightness', (_, arg) => {
      const { device } = arg;
      const currentDevice = this.deviceManager.getByInternalId(device.internalId);
      currentDevice.setSettings(device.settings);
      currentDevice.setBrightness(currentDevice.settings.customBrightness);
      this.refreshTray();
    });

    // custom color rpc listener
    queue.on('request-set-custom-color', (_, arg) => {
      const { device } = arg;
      const currentDevice = this.deviceManager.getByInternalId(device.internalId);
      currentDevice.setSettings(device.settings);
      this.refreshTray();
    });

    // custom cycle color rpc listener
    queue.on('request-cycle-color', (_, arg) => {
      const { index, color } = arg;
      this.cycleAnimation.updateColor(index, color.rgb);
      this.refreshTray();
    });
  }

  async refresh() {
    return this.deviceManager.refreshRazerDevices().then(() => {
      const spectrumPromise = new RazerAnimationCycleSpectrum(this).init().then(animation => {
        this.spectrumAnimation = animation;
      });
      const cyclePromise = new RazerAnimationCycleCustom(this).init().then(animation => {
        this.cycleAnimation = animation;
      });
      return Promise.all([spectrumPromise, cyclePromise]).then(() => true);
    });
  }

  getMenu() {
    return getMenuFor(this);
  }

  closeDevices() {
    this.deviceManager.closeDevices();
  }

  //callbacks from razer menu items, settings....could be part of an interface
  refreshTray(withDeviceRefresh) {
    this.electronApp.refreshTray(withDeviceRefresh);
  }
  showConfirm(message) {
    this.electronApp.app.focus();
    return this.electronApp.dialog.showMessageBox({
      buttons: ["Yes","No"], message: message
    });
  }
  showView(args) {
    this.electronApp.browserWindow.webContents.send('render-view', args);
    this.electronApp.browserWindow.show();
  }
  quit() {
    this.electronApp.app.quit();
  }
}