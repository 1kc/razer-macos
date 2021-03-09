import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureBreathe extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_BREATHE, config);
  }
}