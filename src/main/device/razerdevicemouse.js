import { RazerDevice } from './razerdevice';

export class RazerDeviceMouse extends RazerDevice {
  constructor(razerProperties) {
    super(razerProperties);
  }

  async init(addon) {
    await super.init(addon);
    this.batteryLevel = addon.getBatteryLevel(this.internalId);
    this.chargingStatus = addon.getChargingStatus(this.internalId);
    return this;
  }

  getName() {
    if (this.batteryLevel === -1) {
      return super.getName();
    } else {
      if(this.chargingStatus) {
        return super.getName() + ' - ⚡'+this.batteryLevel.toString()+'%';
      } else {
        return super.getName() + ' - 🔋'+this.batteryLevel.toString()+'%';
      }
    }
  }
}