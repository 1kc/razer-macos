import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureWaveSimple extends Feature {
  constructor(config) {
    super(FeatureIdentifier.WAVE_SIMPLE, config);
  }
}