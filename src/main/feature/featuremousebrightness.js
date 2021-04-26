import { Feature } from './feature';
import { FeatureIdentifier } from './featureidentifier';

export class FeatureMouseBrightness extends Feature {
  constructor(config) {
    super(FeatureIdentifier.MOUSE_BRIGHTNESS, config);
  }

  getDefaultConfiguration() {
    return {
      "enabledMatrix": true,
      "enabledLogo": true,
      "enabledScroll": true,
      "enabledLeft": true,
      "enabledRight": true
    };
  }
}