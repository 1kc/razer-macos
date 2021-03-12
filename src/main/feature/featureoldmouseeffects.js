import { Feature } from './feature';
import { FeatureHelper } from './featurehelper';

export class FeatureOldMouseEffects extends Feature {
  constructor(config) {
    super(FeatureHelper.FEATURE_OLD_MOUSE_EFFECTS, config);
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