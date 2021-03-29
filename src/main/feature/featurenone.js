import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureNone extends Feature {
  constructor(config) {
    super(FeatureIdentifier.NONE, config);
  }
}