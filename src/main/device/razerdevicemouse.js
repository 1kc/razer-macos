import { RazerDevice } from './razerdevice';

export class RazerDeviceMouse extends RazerDevice {
  constructor(addon, razerProperties) {
    super(addon, razerProperties);
  }

  async init() {
    this.batteryLevel = this.addon.getBatteryLevel(this.internalId);
    this.chargingStatus = this.addon.getChargingStatus(this.internalId);
    this.dpi = this.addon.mouseGetDpi(this.internalId);
    return super.init();
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

  getDefaultSettings() {
    return {
      customSensitivity: this.getDPI(),
      customColor1: this.defaultColorSettings,
    }
  }

  setModeNone() {
    this.addon.mouseSetLogoModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.mouseSetLogoModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.addon.mouseSetLogoModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.addon.mouseSetLogoModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.mouseSetLogoModeBreathe(this.internalId, color);
  }

  // device specific
  setWaveSimple(direction) {
    this.addon.mouseSetLogoModeWave(this.internalId, direction);
  }
  setReactive(colorMode) {
    this.addon.mouseSetLogoModeReactive(this.internalId, colorMode);
  }
  setLogoLEDEffect(effect) {
    this.addon.mouseSetLogoLEDEffect(this.internalId, effect);
  }

  getDPI() {
    return this.dpi;
  }
  setDPI(dpi) {
    this.dpi = dpi;
    this.addon.mouseSetDpi(this.internalId, dpi);
  }
}