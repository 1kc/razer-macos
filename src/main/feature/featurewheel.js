import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureWheel extends Feature {
  constructor(config) {
    super(FeatureIdentifier.WHEEL, config);
  }

  getDefaultConfiguration() {
    return {
      rows: -1,
      cols: -1,
    };
  }
}
