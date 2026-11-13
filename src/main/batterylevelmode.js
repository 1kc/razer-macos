import { RazerDeviceType } from './device/razerdevicetype';
import { FeatureIdentifier } from './feature/featureidentifier';

// Battery level moves slowly; each tick is a synchronous USB round trip to the mouse.
const POLL_INTERVAL_MS = 60 * 1000;

// librazermacos reports a mouse paired to a dock (no USB device of its own) with this bit set.
const DOCKED_MOUSE_FLAG = 0x8000;

/**
 * "Battery level" lighting mode for docks: colours the dock from red (empty) to green (full)
 * using the battery of the mouse that is paired to it (or, failing that, any mouse reporting
 * a battery).
 *
 * The mode is stored per dock in its settings (`batteryLevelMode`), so it survives device
 * refreshes and restarts. Devices are looked up again on every tick: after a refresh the old
 * device objects hold released native handles, and writing to those crashes the driver.
 *
 * Choosing any other effect for the dock ends the mode: each tick checks that the dock still
 * shows the colour this mode last applied.
 */
export class BatteryLevelMode {
  constructor(application) {
    this.application = application;
    this.interval = null;
    this.lastApplied = new Map(); // dock productId -> { device, color }
  }

  static isSupportedBy(device) {
    return device.mainType !== RazerDeviceType.MOUSE && device.hasFeature(FeatureIdentifier.BATTERY);
  }

  isActive(dock) {
    return dock.settings != null && dock.settings.batteryLevelMode === true;
  }

  start(dock) {
    this.lastApplied.delete(dock.productId);
    this.saveActive(dock, true);
    this.sync();
  }

  stop(dock) {
    this.lastApplied.delete(dock.productId);
    this.saveActive(dock, false);
    this.sync();
  }

  /**
   * Apply the mode to all docks that have it enabled and keep the timer running only while needed.
   * Call after devices were refreshed.
   */
  sync() {
    const docks = this.getActiveDocks();
    docks.forEach(dock => this.update(dock));

    if (docks.length > 0 && this.interval === null) {
      this.interval = setInterval(() => this.tick(), POLL_INTERVAL_MS);
    } else if (docks.length === 0 && this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  tick() {
    this.getActiveDocks().forEach(dock => {
      const mouse = this.getBatterySource();
      if (mouse !== null) {
        mouse.refresh();
      }
      this.update(dock);
    });
  }

  update(dock) {
    const last = this.lastApplied.get(dock.productId);
    if (last && last.device === dock && !this.dockStillShows(dock, last.color)) {
      // Another effect was chosen for the dock since the last tick.
      this.stop(dock);
      this.application.refreshTray(); // update the menu checkbox
      return;
    }

    const mouse = this.getBatterySource();
    if (mouse === null || mouse.batteryLevel == null || mouse.batteryLevel < 0) {
      // Mouse asleep or gone: keep whatever colour the dock shows.
      return;
    }

    const color = BatteryLevelMode.colorFor(mouse.batteryLevel);
    if (last && last.device === dock && last.color.every((value, index) => value === color[index])) {
      return;
    }

    try {
      dock.setModeStaticNoStore(color);
      this.lastApplied.set(dock.productId, { device: dock, color: color });
    } catch (error) {
      console.warn('Battery level mode: failed to set dock colour', error);
    }
  }

  dockStillShows(dock, color) {
    const args = dock.activeModeArguments;
    return dock.activeMode === 'staticNoStore'
      && Array.isArray(args) && args.length === color.length
      && args.every((value, index) => value === color[index]);
  }

  getActiveDevices() {
    return this.application.razerApplication.deviceManager.activeRazerDevices || [];
  }

  getActiveDocks() {
    return this.getActiveDevices().filter(device => BatteryLevelMode.isSupportedBy(device) && this.isActive(device));
  }

  getBatterySource() {
    const mice = this.getActiveDevices().filter(device =>
      device.mainType === RazerDeviceType.MOUSE && device.hasFeature(FeatureIdentifier.BATTERY));
    return mice.find(mouse => (mouse.productId & DOCKED_MOUSE_FLAG) !== 0)
      || mice.find(mouse => mouse.chargingStatus)
      || mice[0]
      || null;
  }

  saveActive(dock, active) {
    if (dock.settings == null) {
      return;
    }
    dock.settings.batteryLevelMode = active;
    dock.setSettings(dock.settings);
  }

  // Red at 0%, yellow at 50%, green at 100%.
  static colorFor(batteryLevel) {
    const level = Math.max(0, Math.min(100, batteryLevel));
    if (level < 50) {
      return [255, Math.round(5.1 * level), 0];
    }
    return [Math.round(510 - 5.1 * level), 255, 0];
  }
}
