import { getSettingsFor } from '../settingsmanager';

export class RazerDevice {
  constructor(addon, razerProperties) {
    this.addon = addon;
    this.name = razerProperties.name;
    this.productId = razerProperties.productId;
    this.internalId = razerProperties.internalId;
    this.mainType = razerProperties.mainType;
    this.features = razerProperties.features;
  }

  async init() {
    this.settings = await getSettingsFor(this);
    return this;
  }

  getName() {
    return this.name;
  }

  getSettingsKey() {
    return 'razer_'+this.productId;
  }

  //override in device types
  setModeNone() {}
  setModeStaticNoStore(color) {}
  setModeStatic(color) {}
  setSpectrum() {}
  setBreathe(color) {}
}