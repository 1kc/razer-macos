import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureReactive extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_REACTIVE, config);
  }
}