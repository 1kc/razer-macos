import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureSpectrum extends Feature {
  constructor(config) {
    super(FeatureIdentifier.SPECTRUM, config);
  }
}