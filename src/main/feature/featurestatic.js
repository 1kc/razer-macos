import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureStatic extends Feature {
  constructor(config) {
    super(FeatureIdentifier.STATIC, config);
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