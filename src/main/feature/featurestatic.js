import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureStatic extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_STATIC, config);
  }

  getDefaultConfiguration() {
    return {
      "enabledRed": true,
      "enabledGreen": true,
      "enabledBlue": true
    };
  }

  hasAllColors() {
    return this.configuration.enabledRed
      && this.configuration.enabledGreen
      && this.configuration.enabledBlue;
  }
}