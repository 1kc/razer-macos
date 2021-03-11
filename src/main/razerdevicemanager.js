import addon from '../driver';
import { RazerDeviceKeyboard } from './device/razerdevicekeyboard';
import { RazerDeviceMouse } from './device/razerdevicemouse';
import { RazerDeviceMouseDock } from './device/razerdevicemousedock';
import { RazerDeviceMouseMat } from './device/razerdevicemousemat';
import { RazerDeviceEgpu } from './device/razerdeviceegpu';
import { RazerDeviceHeadphone } from './device/razerdeviceheadphone';
import { RazerDeviceAccessory } from './device/razerdeviceaccessory';
import { RazerDevice } from './device/razerdevice';
import { FeatureNone } from './feature/featurenone';
import { FeatureStatic } from './feature/featurestatic';
import { FeatureWaveExtended } from './feature/featurewaveextended';
import { FeatureSpectrum } from './feature/featurespectrum';
import { FeatureReactive } from './feature/featurereactive';
import { FeatureBreathe } from './feature/featurebreathe';
import { FeatureStarlight } from './feature/featurestarlight';
import { FeatureRipple } from './feature/featureripple';
import { FeatureBrightness } from './feature/featurebrightness';
import { FeatureWaveSimple } from './feature/featurewavesimple';
import { FeatureOldMouseEffects } from './feature/featureoldmouseeffects';
import { FeatureHelper } from './feature/featurehelper';
import { FeatureMouseBrightness } from './feature/featuremousebrightness';
import { FeatureMousePollRate } from './feature/featuremousepollrate';

/**
 * Responsible to fetch all attached Razer devices and map them to RazerDevice instances with features
 * @constructor
 */
export class RazerDeviceManager {
  constructor(settingsManager) {
    this.addon = addon;
    this.settingsManager = settingsManager;
    this.razerConfigDevices = this.getAllRazerDeviceConfigurations();
    this.activeRazerDevices = null;
  }

  async refreshRazerDevices() {
    this.closeDevices();

    const devicePromises = this.addon.getAllDevices().map(async foundDevice => {
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
      const razerDevice = this.createRazerDeviceFrom(razerProperties);
      return razerDevice.init();
    });

    return Promise.all(devicePromises).then(devices => {
      return devices.filter(device => device !== null);
    }).then((devices) => {
      this.activeRazerDevices = this.sortDevices(devices);
    });
  }

  sortDevices(devices) {
    const deviceOrder = ['keyboard', 'mouse', 'mousedock', 'mousemat', 'egpu', 'headphone', 'accessory']; // we could offer this as a personal setting in the future
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
    let deviceFeatures;

    switch (razerProperties.mainType) {
      case 'keyboard':
        device = RazerDeviceKeyboard;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveExtended(),
          new FeatureSpectrum(),
          new FeatureReactive(),
          new FeatureBreathe(),
          new FeatureStarlight(),
          new FeatureRipple(),
          new FeatureBrightness(),
        ];
        break;
      case 'mouse':
        device = RazerDeviceMouse;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureReactive(),
          new FeatureBreathe(),
          new FeatureOldMouseEffects(),
          new FeatureMouseBrightness(),
          new FeatureMousePollRate(),
        ];
        break;
      case 'mousedock':
        device = RazerDeviceMouseDock;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
        break;
      case 'mousemat':
        device = RazerDeviceMouseMat;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
        break;
      case 'egpu':
        device = RazerDeviceEgpu;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
        break;
      case 'headphone':
        device = RazerDeviceHeadphone;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
        break;
      case 'accessory':
        device = RazerDeviceAccessory;
        deviceFeatures = [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveExtended(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
        break;
      default:
        device = RazerDevice;
        deviceFeatures = [];
    }

    const razerDeviceProperties = {
      name: razerProperties.name,
      productId: razerProperties.productId,
      internalId: razerProperties.internalId,
      mainType: razerProperties.mainType,
      image: razerProperties.image,
      features: null,
    };

    /// create from device standard or from feature list
    if (razerProperties.features == null) {
      razerDeviceProperties.features = deviceFeatures;
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
          feature.configuration = overriddenFeatureConfig;
        }
      });
    }

    return new device(this.addon, this.settingsManager, razerDeviceProperties);
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

  getByInternalId(internalId) {
    return this.activeRazerDevices.find(device => device.internalId === internalId);
  }

  closeDevices() {
    if (this.activeRazerDevices !== null) {
      this.addon.closeAllDevices();
      this.activeRazerDevices = null;
    }
  }

  destroy() {
    this.activeRazerDevices.forEach(device => device.destroy());
    this.closeDevices();
    this.addon = null;
  }
}