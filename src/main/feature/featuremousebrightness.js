import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureMouseBrightness extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_MOUSE_BRIGHTNESS, config);
  }
}