import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureReactive extends Feature {
  constructor(config) {
    super(FeatureIdentifier.REACTIVE, config);
  }
}