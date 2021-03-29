import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureBrightness extends Feature {
  constructor(config) {
    super(FeatureIdentifier.BRIGHTNESS, config);
  }
}