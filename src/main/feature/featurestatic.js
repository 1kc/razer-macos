import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureStatic extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_STATIC, config);
  }

  hasAllColors() {
    if(this.configuration == null) {
      return true;
    }
    return !this.configuration.disabledRed
      && !this.configuration.disabledGreen
      && !this.configuration.disabledBlue;
  }
}