import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureOldMouseEffects extends Feature {
  constructor(config) {
    super(FeatureIdentifier.OLD_MOUSE_EFFECTS, config);
  }

  getDefaultConfiguration() {
    return {
      "enabledStatic" : true,
      "enabledBlinking" : true,
      "enabledPulsate" : true,
      "enabledScroll" : true
    }
  }
}