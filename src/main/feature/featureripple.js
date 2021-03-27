import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureRipple extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_RIPPLE, config);
  }

  getDefaultConfiguration() {
    return {
      rows: -1,
      cols: -1,
    }
  }
}