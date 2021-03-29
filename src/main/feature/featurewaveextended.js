import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureWaveExtended extends Feature {
  constructor(config) {
    super(FeatureIdentifier.WAVE_EXTENDED, config);
  }
}