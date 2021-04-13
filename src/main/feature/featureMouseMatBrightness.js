import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureMouseMatBrightness extends Feature {
  constructor(config) {
    super(FeatureIdentifier.MOUSE_MAT_BRIGHTNESS, config);
  }
}