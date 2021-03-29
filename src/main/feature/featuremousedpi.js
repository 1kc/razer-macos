import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureMouseDPI extends Feature {
  constructor(config) {
    super(FeatureIdentifier.MOUSE_DPI, config);
  }

  getDefaultConfiguration() {
    return {
      "step": 100,
      "min": 100,
      "max": 20000,
    };
  }
}