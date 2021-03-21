import { RazerDeviceManager } from './razerdevicemanager';
import { SettingsManager } from './settingsmanager';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';
import { StateManager } from './statemanager';

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
    this.stateManager = new StateManager(this.settingsManager);
    this.deviceManager = new RazerDeviceManager(this.settingsManager, this.stateManager);
    this.spectrumAnimation = null;
    this.cycleAnimation = null;
  }

  async refresh(withOnStartState = true) {
    return this.deviceManager.refreshRazerDevices().then(() => {
      const spectrumPromise = new RazerAnimationCycleSpectrum(this).init().then(animation => {
        this.spectrumAnimation = animation;
      });
      const cyclePromise = new RazerAnimationCycleCustom(this).init().then(animation => {
        this.cycleAnimation = animation;
      });
      const resetAll = this.stateManager.init(this.deviceManager.activeRazerDevices, withOnStartState);
      return Promise.all([spectrumPromise, cyclePromise, resetAll]).then(() => true);
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