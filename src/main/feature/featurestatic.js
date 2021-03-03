import { Feature } from './feature';

export class FeatureStatic extends Feature {
  constructor(config) {
    super('static', config);
  }
}