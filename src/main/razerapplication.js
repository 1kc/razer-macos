import { RazerDeviceManager } from './razerdevicemanager';
import { SettingsManager } from './settingsmanager';
import { RazerAnimationCycleSpectrum } from './animation/animationcyclespectrum';
import { RazerAnimationCycleCustom } from './animation/animationcyclecustom';
import { StateManager } from './statemanager';
import { RazerDeviceMonitor } from './razerdevicemonitor';

/**
 * Owns one device generation at a time. Automatic refresh restores live lighting;
 * existing startup and power-event callers retain their explicit state choices.
 */
export class RazerApplication {
  constructor(onRefresh = () => {}) {
    this.settingsManager = new SettingsManager();
    this.stateManager = new StateManager(this.settingsManager);
    this.deviceManager = new RazerDeviceManager(this.settingsManager, this.stateManager);
    this.spectrumAnimation = new RazerAnimationCycleSpectrum(this);
    this.cycleAnimation = new RazerAnimationCycleCustom(this);
    this.deviceMonitor = new RazerDeviceMonitor(this);
    this.animationsInitialized = false;
    this.pendingAnimationRestore = null;
    this.refreshQueue = Promise.resolve();
    this.refreshRequests = new Map();
    this.isRefreshing = false;
    this.destroyed = false;
    this.onRefresh = onRefresh;
  }

  refresh(withOnStartState = true, restoreCurrentState = false) {
    if (this.destroyed) {
      return Promise.reject(new Error('The Razer application has been closed.'));
    }
    const key = String(withOnStartState) + ':' + String(restoreCurrentState);
    if (this.refreshRequests.has(key)) {
      return this.refreshRequests.get(key);
    }
    const operation = this.refreshQueue.then(() =>
      this.refreshDevices(withOnStartState, restoreCurrentState));
    // A failed transaction must not poison subsequent legitimate refreshes.
    this.refreshQueue = operation.then(() => undefined, () => undefined);
    this.refreshRequests.set(key, operation);
    const release = () => {
      if (this.refreshRequests.get(key) === operation) {
        this.refreshRequests.delete(key);
      }
    };
    operation.then(release, release);
    return operation;
  }

  notifyRefresh(refreshing) {
    try {
      this.onRefresh(refreshing);
    } catch (error) {
      console.warn('Device-list view update failed:', error.message);
    }
  }

  requireOpen() {
    if (this.destroyed) {
      throw new Error('The Razer application has been closed.');
    }
  }

  async refreshDevices(withOnStartState, restoreCurrentState) {
    this.requireOpen();
    this.isRefreshing = true;
    this.notifyRefresh(true);
    const running = {
      spectrum: this.spectrumAnimation.cycleColorsInterval !== null,
      custom: this.cycleAnimation.cycleColorsInterval !== null,
    };
    if (!restoreCurrentState) {
      this.pendingAnimationRestore = null;
    } else if (running.spectrum || running.custom) {
      this.pendingAnimationRestore = running;
    }

    try {
      this.deviceManager.rememberDeviceStates();
      this.stopAnimations();
      this.stateManager.devices = [];
      if (!this.animationsInitialized) {
        await Promise.all([this.spectrumAnimation.init(), this.cycleAnimation.init()]);
        this.requireOpen();
        this.animationsInitialized = true;
      }

      let topology = null;
      if (typeof this.deviceManager.addon.getDeviceTopology === 'function') {
        try {
          topology = this.deviceManager.readTopology();
        } catch (error) {
          if (restoreCurrentState) {
            throw error;
          }
          // A topology-observation failure does not disable manual refresh.
          console.warn('Device topology is temporarily unavailable:', error.message);
        }
      }

      await this.deviceManager.refreshRazerDevices();
      this.requireOpen();
      if (topology !== null && !this.deviceManager.matchesTopology(topology)) {
        throw new Error('Some connected Razer devices are not ready to open.');
      }
      await this.stateManager.init(this.deviceManager.activeRazerDevices, withOnStartState);
      this.requireOpen();

      if (restoreCurrentState) {
        this.deviceManager.restoreDeviceStates();
      }
      if (restoreCurrentState && this.pendingAnimationRestore !== null) {
        if (this.pendingAnimationRestore.spectrum) {
          this.spectrumAnimation.start(false);
        }
        if (this.pendingAnimationRestore.custom) {
          this.cycleAnimation.start(false);
        }
      }
      this.deviceMonitor.accept(topology);
      this.pendingAnimationRestore = null;
      return true;
    } catch (error) {
      this.stopAnimations();
      this.stateManager.devices = [];
      // Never let defaults from a failed generation replace the last good cache.
      try {
        this.deviceManager.closeDevices();
      } catch (cleanupError) {
        console.warn('Failed device generation cleanup:', cleanupError.message);
      }
      this.deviceMonitor.invalidate();
      throw error;
    } finally {
      this.isRefreshing = false;
      if (!this.destroyed) {
        this.notifyRefresh(false);
        this.deviceMonitor.start();
      }
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.deviceMonitor.stop();
    this.stopAnimations();
    this.stateManager.devices = [];
    this.deviceManager.destroy();
  }

  stopAnimations() {
    this.cycleAnimation.stop();
    this.spectrumAnimation.stop();
  }
}