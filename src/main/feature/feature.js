export class Feature {
  constructor(featureIdentifier, config = null) {
    this.featureIdentifier = featureIdentifier;
    this.configuration = config;
  }
}