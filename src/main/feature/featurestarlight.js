import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureStarlight extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_STARLIGHT, config);
  }
}