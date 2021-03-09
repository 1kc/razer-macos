import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureSpectrum extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_SPECTRUM, config);
  }
}