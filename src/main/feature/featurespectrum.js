import { Feature } from './feature';

export class FeatureSpectrum extends Feature {
  constructor(config) {
    super('spectrum', config);
  }
  getMenuItemFor(device, razerApp) {
    return {
      label: 'Spectrum',
      click() {
        device.setSpectrum();
      },
    };
  }
}