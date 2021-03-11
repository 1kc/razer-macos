import { RazerDeviceManager } from './razerdevicemanager';
import { SettingsManager } from './settingsmanager';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';

/**
 * Main application
 * DeviceManager: Queries all the devices and sets up their features
 * SettingsManager: Used to save settings for the application / devices
 *
 * Animations: Animations which are run on all devices in parallel are held here as well.
 * @constructor
 */
export class RazerApplication {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.deviceManager = new RazerDeviceManager(this.settingsManager);
    this.spectrumAnimation = null;
    this.cycleAnimation = null;
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

  destroy() {
    this.deviceManager.destroy();
  }

  stopAnimations() {
    this.cycleAnimation.stop();
    this.spectrumAnimation.stop();
  }
}