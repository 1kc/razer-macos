import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureRipple extends Feature {
  constructor(config) {
    super(FeatureIdentifier.RIPPLE, config);
  }

  getDefaultConfiguration() {
    return {
      rows: -1,
      cols: -1,
    }
  }
}