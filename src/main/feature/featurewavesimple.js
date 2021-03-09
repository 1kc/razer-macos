import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureWaveSimple extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_WAVE_SIMPLE, config);
  }
}