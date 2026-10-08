import addon from '../driver';
import { RazerDeviceKeyboard } from './device/razerdevicekeyboard';
import { RazerDeviceMouse } from './device/razerdevicemouse';
import { RazerDeviceMouseDock } from './device/razerdevicemousedock';
import { RazerDeviceMouseMat } from './device/razerdevicemousemat';
import { RazerDeviceEgpu } from './device/razerdeviceegpu';
import { RazerDeviceHeadphone } from './device/razerdeviceheadphone';
import { RazerDeviceAccessory } from './device/razerdeviceaccessory';
import { RazerDevice } from './device/razerdevice';
import { FeatureHelper } from './feature/featurehelper';
import { RazerDeviceType } from './device/razerdevicetype';

/**
 * Responsible to fetch all attached Razer devices and map them to RazerDevice instances with features
 * @constructor
 */
export class RazerDeviceManager {
  constructor(settingsManager, stateManager) {
    this.addon = addon;
    this.settingsManager = settingsManager;
    this.stateManager = stateManager;
    this.razerConfigDevices = this.getAllRazerDeviceConfigurations();
    this.activeRazerDevices = [];
    this.pendingDevices = [];
    this.generation = 0;
    this.destroyed = false;
    this.nativeDevicesOpen = false;
    this.retainedDeviceStates = new Map();
  }

  async refreshRazerDevices() {
    if (this.destroyed) {
      throw new Error('The device manager has been closed.');
    }
    this.closeDevices();
    const generation = this.generation;
    const driver = {};
    // Old menu/animation objects must never call into a replacement handle table.
    Object.keys(this.addon).forEach(name => {
      const method = this.addon[name];
      if (typeof method === 'function') {
        driver[name] = (...args) => {
          if (!this.destroyed && generation === this.generation) {
            return method.apply(this.addon, args);
          }
          return undefined;
        };
      }
    });
    this.currentDriver = driver;

    try {
      this.nativeDevicesOpen = true;
      const foundDevices = this.addon.getAllDevices();
      const devicePromises = foundDevices.map(async foundDevice => {
        const configurationDevice = this.razerConfigDevices.find(d => d.productId === foundDevice.productId);
        if (configurationDevice === undefined) {
          return null;
        }
        const razerProperties = {
          name: configurationDevice.name,
          productId: foundDevice.productId,
          internalId: foundDevice.internalDeviceId,
          mainType: configurationDevice.mainType,
          image: configurationDevice.image,
          features: configurationDevice.features,
          featuresMissing: configurationDevice.featuresMissing,
          featuresConfig: configurationDevice.featuresConfig,
        };
        const device = this.createRazerDeviceFrom(razerProperties);
        this.pendingDevices.push(device);
        return device.init();
      });
      // Wait for every initializer before releasing their shared native table.
      const results = await Promise.allSettled(devicePromises);
      if (this.destroyed || generation !== this.generation) {
        throw new Error('Device refresh was canceled.');
      }
      const failure = results.find(result => result.status === 'rejected');
      if (failure) {
        throw failure.reason;
      }
      this.activeRazerDevices = this.sortDevices(
        results.map(result => result.value).filter(device => device !== null));
      this.pendingDevices = [];
    } catch (error) {
      if (generation === this.generation) {
        this.closeDevices();
      }
      throw error;
    }
  }

  readTopology() {
    if (this.destroyed || !this.addon || typeof this.addon.getDeviceTopology !== 'function') {
      throw new Error('Passive device topology is unavailable.');
    }
    const observed = this.addon.getDeviceTopology();
    if (!Array.isArray(observed)) {
      throw new Error('Invalid device topology snapshot.');
    }
    const configured = new Set(this.razerConfigDevices.map(device => device.productId));
    const seen = new Set();
    const supported = [];
    observed.forEach(entry => {
      if (!entry || typeof entry.registryId !== 'string' ||
          !/^[0-9]+$/.test(entry.registryId) ||
          !Number.isInteger(entry.productId) || entry.productId < 0 || entry.productId > 0xffff ||
          seen.has(entry.registryId)) {
        throw new Error('Invalid device topology entry.');
      }
      seen.add(entry.registryId);
      if (configured.has(entry.productId)) {
        supported.push(entry);
      }
    });
    return {
      fingerprint: supported.map(entry => entry.productId + ':' + entry.registryId).sort().join('|'),
      products: supported.map(entry => entry.productId).sort((a, b) => a - b),
    };
  }

  matchesTopology(topology) {
    const opened = this.activeRazerDevices.map(device => device.productId).sort((a, b) => a - b);
    return opened.length === topology.products.length &&
      opened.every((productId, index) => productId === topology.products[index]);
  }

  deviceStateKey(device) {
    return device.mainType + ':' + device.productId;
  }

  countDeviceKeys() {
    const counts = new Map();
    this.activeRazerDevices.forEach(device => {
      const key = this.deviceStateKey(device);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }

  rememberDeviceStates() {
    const counts = this.countDeviceKeys();
    this.activeRazerDevices.forEach(device => {
      const key = this.deviceStateKey(device);
      if (counts.get(key) !== 1) {
        // The existing driver has no physical serial identity. Do not guess
        // which of two identical products should receive a retained state.
        this.retainedDeviceStates.delete(key);
        return;
      }
      const state = device.getState();
      if (state && state.mode != null && !device.destroyed) {
        this.retainedDeviceStates.set(key, JSON.parse(JSON.stringify(state)));
      }
    });
    // Disconnected devices intentionally retain their last meaningful state.
  }

  restoreDeviceStates() {
    const counts = this.countDeviceKeys();
    this.activeRazerDevices.forEach(device => {
      const key = this.deviceStateKey(device);
      if (counts.get(key) !== 1) {
        this.retainedDeviceStates.delete(key);
        return;
      }
      const state = this.retainedDeviceStates.get(key);
      if (state && state.mode != null) {
        device.resetToState(JSON.parse(JSON.stringify(state)));
      }
    });
  }

  sortDevices(devices) {
    const deviceOrder = [
      RazerDeviceType.KEYBOARD,
      RazerDeviceType.MOUSE,
      RazerDeviceType.MOUSEDOCK,
      RazerDeviceType.MOUSEMAT,
      RazerDeviceType.EGPU,
      RazerDeviceType.HEADPHONE,
      RazerDeviceType.ACCESSORY
    ]; // we could offer this as a personal setting in the future

    return devices.sort((deviceA, deviceB) => {
      const mainTypeAOrder = deviceOrder.indexOf(deviceA.mainType);
      const mainTypeBOrder = deviceOrder.indexOf(deviceB.mainType);
      if (mainTypeAOrder === mainTypeBOrder) {
        if (deviceA.name < deviceB.name) {
          return -1;
        }
        if (deviceA.name > deviceB.name) {
          return 1;
        }
        return 0;
      }
      return mainTypeAOrder - mainTypeBOrder;
    });
  }

  createRazerDeviceFrom(razerProperties) {
    let device;

    switch (razerProperties.mainType) {
      case RazerDeviceType.KEYBOARD:
        device = RazerDeviceKeyboard;
        break;
      case RazerDeviceType.MOUSE:
        device = RazerDeviceMouse;
        break;
      case RazerDeviceType.MOUSEDOCK:
        device = RazerDeviceMouseDock;
        break;
      case RazerDeviceType.MOUSEMAT:
        device = RazerDeviceMouseMat;
        break;
      case RazerDeviceType.EGPU:
        device = RazerDeviceEgpu;
        break;
      case RazerDeviceType.HEADPHONE:
        device = RazerDeviceHeadphone;
        break;
      case RazerDeviceType.ACCESSORY:
        device = RazerDeviceAccessory;
        break;
      default:
        device = RazerDevice;
    }

    const razerDeviceProperties = {
      name: razerProperties.name,
      productId: razerProperties.productId,
      internalId: razerProperties.internalId,
      generation: this.generation,
      mainType: razerProperties.mainType,
      image: razerProperties.image,
      features: null,
    };

    /// create from device standard or from feature list
    if (razerProperties.features == null) {
      razerDeviceProperties.features = FeatureHelper.getDefaultFeaturesFor(razerProperties.mainType);
    } else {
      razerDeviceProperties.features = razerProperties.features.map(featureConfig => FeatureHelper.createFeatureFrom(featureConfig));
    }

    /// remove features which are stated being missing
    if (razerProperties.featuresMissing != null) {
      razerDeviceProperties.features = razerDeviceProperties.features.filter(feature => !razerProperties.featuresMissing.some(missingFeature => missingFeature === feature.featureIdentifier));
    }

    /// override configs if available
    if (razerProperties.featuresConfig != null) {
      razerProperties.featuresConfig.forEach(featureConfig => {
        const featureIdentifier = Object.keys(featureConfig)[0];
        const overriddenFeatureConfig = Object.values(featureConfig)[0];
        const feature = razerDeviceProperties.features.find(f => f.featureIdentifier === featureIdentifier);

        if(feature) {
          feature.configuration = Object.assign(feature.configuration, overriddenFeatureConfig);
        }
      });
    }

    return new device(this.currentDriver, this.settingsManager, this.stateManager, razerDeviceProperties);
  }

  getAllRazerDeviceConfigurations() {
    const allFiles = require.context('../devices', true, /\.json$/i);
    return allFiles.keys().map((key) => {
      const razerConfigDevice = allFiles(key);
      return {
        name: razerConfigDevice.name,
        productId: parseInt(razerConfigDevice.productId, 16),
        mainType: razerConfigDevice.mainType,
        features: razerConfigDevice.features,
        featuresMissing: razerConfigDevice.featuresMissing,
        featuresConfig: razerConfigDevice.featuresConfig,
        image: razerConfigDevice.image,
      };
    });
  }

  getByInternalId(internalId, generation) {
    return this.activeRazerDevices.find(device =>
      device.internalId === internalId &&
      (generation === undefined || device.generation === generation));
  }

  closeDevices() {
    const retired = Array.from(new Set(this.activeRazerDevices.concat(this.pendingDevices)));
    // Invalidate callbacks before destroying effects or closing native handles.
    this.generation++;
    this.activeRazerDevices = [];
    this.pendingDevices = [];
    this.currentDriver = null;
    retired.forEach(device => {
      try {
        device.destroy();
      } catch (error) {
        console.warn('Device effect cleanup failed:', error.message);
      }
    });
    if (this.addon && this.nativeDevicesOpen) {
      try {
        this.addon.closeAllDevices();
      } finally {
        this.nativeDevicesOpen = false;
      }
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.closeDevices();
    this.retainedDeviceStates.clear();
    this.addon = null;
  }
}