import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureFire extends Feature {
  constructor(config) {
    super(FeatureIdentifier.FIRE, config);
  }

  getDefaultConfiguration() {
    return {
      rows: -1,
      cols: -1,
    };
  }
}
