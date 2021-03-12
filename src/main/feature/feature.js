export class Feature {
  constructor(featureIdentifier, config = null) {
    this.featureIdentifier = featureIdentifier;
    if(config == null) {
      this.configuration = this.getDefaultConfiguration();
    } else {
      this.configuration = config;
    }

  }

  getDefaultConfiguration() {
    return null;
  }
}