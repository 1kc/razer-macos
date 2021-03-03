import { RazerDevice } from './razerdevice';

export class RazerDeviceMouse extends RazerDevice {
  constructor(addon, settingsManager, razerProperties) {
    super(addon, settingsManager, razerProperties);
  }

  async init() {
    this.batteryLevel = this.addon.getBatteryLevel(this.internalId);
    this.chargingStatus = this.addon.getChargingStatus(this.internalId);
    this.dpi = this.addon.mouseGetDpi(this.internalId);
    return super.init();
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
    super.setModeStatic(color);
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