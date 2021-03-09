import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureNone extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_NONE, config);
  }
}