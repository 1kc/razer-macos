export class RazerDevice {
  constructor(addon, settingsManager, razerDeviceProperties) {
    this.addon = addon;
    this.settingsManager = settingsManager;

    this.name = razerDeviceProperties.name;
    this.productId = razerDeviceProperties.productId;
    this.internalId = razerDeviceProperties.internalId;
    this.mainType = razerDeviceProperties.mainType;
    this.image = razerDeviceProperties.image;
    this.features = razerDeviceProperties.features;

    this.defaultColorSettings = {
      hex: '#ffff00',
      rgb: {
        r: 255,
        g: 255,
        b: 0,
      }
    };
  }

  async init() {
    this.settings = await this.settingsManager.getSettingsFor(this);
    return this;
  }

  getName() {
    return this.name;
  }

  getSettingsKey() {
    return 'razer_'+this.productId;
  }

  getDefaultSettings() {
    return {
      customColor1: this.defaultColorSettings
    };
  }

  async setSettings(settings) {
    this.settings = settings;
    return this.settingsManager.saveSettingsFor(this);
  }

  //override in device types
  setModeNone() {}
  setModeStaticNoStore(color) {}
  setModeStatic(color) {
    this._isModeStaticActive = true;
  }
  isModeStaticActive() {
    return this._isModeStaticActive;
  }
  setSpectrum() {}
  setBreathe(color) {}

  serialize() {
    return {
      name: this.name,
      productId: this.productId,
      internalId: this.internalId,
      mainType: this.mainType,
      features: this.features,
      settings: this.settings,
      image: this.image,
    };
  }
}