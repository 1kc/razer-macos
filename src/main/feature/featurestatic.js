import { Feature } from './feature';

export class FeatureStatic extends Feature {
  constructor(config) {
    super('static', config);
  }

  hasAllColors() {
    if(this.configuration == null) {
      return true;
    }
    return !this.configuration.disabledRed
      && !this.configuration.disabledGreen
      && !this.configuration.disabledBlue;
  }
}