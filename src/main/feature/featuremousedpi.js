import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureMouseDPI extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_MOUSE_DPI, config);
  }
}