import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureWaveExtended extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_WAVE_EXTENDED, config);
  }
}