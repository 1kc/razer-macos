import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureBreathe extends Feature {
  constructor(config) {
    super(FeatureIdentifier.BREATHE, config);
  }
}