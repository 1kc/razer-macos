import { RazerDeviceKeyboard } from './device/razerdevicekeyboard';
import { RazerDeviceMouse } from './device/razerdevicemouse';
import { RazerDeviceMouseDock } from './device/razerdevicemousedock';
import { RazerDeviceMouseMat } from './device/razerdevicemousemat';
import { RazerDeviceEgpu } from './device/razerdeviceegpu';
import { RazerDeviceHeadphone } from './device/razerdeviceheadphone';
import { RazerDeviceAccessory } from './device/razerdeviceaccessory';
import { RazerDevice } from './device/razerdevice';

const fs = require('fs');

export class RazerDeviceManager {
  constructor(configFolder) {
    this.configFolder = configFolder;
    this.razerConfigDevices = this.getAllRazerDeviceConfigurations();
    this.activeRazerDevices = null;
  }

  refreshRazerDevices(addon, settingsManager) {
    this.closeDevices(addon);

    const devicePromises = addon.getAllDevices().map(async foundDevice => {
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
        };
        const razerDevice = this.createRazerDeviceFrom(addon, settingsManager, razerProperties);
        return razerDevice.init();
      });

    return Promise.all(devicePromises, devices => {
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
      if(mainTypeAOrder === mainTypeBOrder) {
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

  closeDevices(addon) {
    if(this.activeRazerDevices !== null) {
      addon.closeAllDevices();
      this.activeRazerDevices = null;
    }
  }

  createRazerDeviceFrom(addon, settingsManager, razerProperties) {
    switch (razerProperties.mainType) {
      case 'keyboard':
        return new RazerDeviceKeyboard(addon, settingsManager, razerProperties);
      case 'mouse':
        return new RazerDeviceMouse(addon, settingsManager, razerProperties);
      case 'mousedock':
        return new RazerDeviceMouseDock(addon, settingsManager, razerProperties);
      case 'mousemat':
        return new RazerDeviceMouseMat(addon, settingsManager, razerProperties);
      case 'egpu':
        return new RazerDeviceEgpu(addon, settingsManager, razerProperties);
      case 'headphone':
        return new RazerDeviceHeadphone(addon, settingsManager, razerProperties);
      case 'accessory':
        return new RazerDeviceAccessory(addon, settingsManager, razerProperties);
      default:
        return new RazerDevice(addon, settingsManager, razerProperties);
    }
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