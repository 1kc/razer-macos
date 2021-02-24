import { getSettingsFor } from '../settingsmanager';

export class RazerDevice {
  constructor(razerProperties) {
    this.name = razerProperties.name;
    this.productId = razerProperties.productId;
    this.internalId = razerProperties.internalId;
    this.mainType = razerProperties.mainType;
    this.features = razerProperties.features;
  }

  async init(addon) {
    this.settings = await getSettingsFor(this);
    return this;
  }

  getName() {
    return this.name;
  }

  getSettingsKey() {
    return 'razer_'+this.productId;
  }
}