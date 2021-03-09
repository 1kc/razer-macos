import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureBrightness extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_BRIGHTNESS, config);
  }
}