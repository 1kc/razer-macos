import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureMousePollRate extends Feature {
  constructor(config) {
    super(FeatureIdentifier.POLL_RATE, config);
  }

  getDefaultConfiguration() {
    return {
      "pollRates": [125, 250, 500, 1000]
    };
  }
}