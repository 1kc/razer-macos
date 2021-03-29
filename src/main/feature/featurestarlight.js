import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureStarlight extends Feature {
  constructor(config) {
    super(FeatureIdentifier.STARLIGHT, config);
  }
}