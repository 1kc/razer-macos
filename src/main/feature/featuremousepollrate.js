import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureMousePollRate extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_POLL_RATE, config);
  }

  getDefaultConfiguration() {
    return {
      "pollRates": [125, 250, 500, 1000]
    };
  }
}