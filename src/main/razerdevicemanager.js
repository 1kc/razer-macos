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

const fs = require('fs');

/**
 * Responsible to fetch all attached Razer devices and map them to RazerDevice instances with features
 * @constructor
 */
export class RazerDeviceManager {
  constructor(settingsManager, configFolder) {
    this.addon = addon;
    this.settingsManager = settingsManager;
    this.configFolder = configFolder;
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

  closeDevices() {
    if (this.activeRazerDevices !== null) {
      this.addon.closeAllDevices();
      this.activeRazerDevices = null;
    }
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

    if (razerProperties.features == null) {
      razerDeviceProperties.features = deviceFeatures;
    } else {
      razerDeviceProperties.features = razerProperties.features.map(featureConfig => FeatureHelper.createFeatureFrom(featureConfig));
    }

    if (razerProperties.featuresMissing != null) {
      razerDeviceProperties.features = razerDeviceProperties.features.filter(feature => !razerProperties.featuresMissing.some(missingFeature => missingFeature === feature.featureIdentifier));
    }

    return new device(this.addon, this.settingsManager, razerDeviceProperties);
  }

  getAllRazerDeviceConfigurations() {
    return fs.readdirSync(this.configFolder).map(filename => {
      if (filename.endsWith('.json')) {
        const razerConfigDevice = JSON.parse(fs.readFileSync(this.configFolder + '/' + filename, 'utf-8'));
        return {
          name: razerConfigDevice.name,
          productId: parseInt(razerConfigDevice.productId, 16),
          mainType: razerConfigDevice.mainType,
          features: razerConfigDevice.features,
          featuresMissing: razerConfigDevice.featuresMissing,
          image: razerConfigDevice.image,
        };
      }
      return null;
    }).filter(razerDevice => {
      return razerDevice !== null;
    });
  }

  getByInternalId(internalId) {
    return this.activeRazerDevices.find(device => device.internalId === internalId);
  }
}