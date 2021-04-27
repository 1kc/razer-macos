import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureBattery extends Feature {
  constructor(config) {
    super(FeatureIdentifier.BATTERY, config);
  }
}