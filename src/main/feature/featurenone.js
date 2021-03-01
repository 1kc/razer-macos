import { Feature } from './feature';

export class FeatureNone extends Feature {
  constructor(config) {
    super('none', config);
  }

  getMenuItemFor(device, razerApp) {
    return {
      label: 'None',
      click() {
        device.setModeNone();
      },
    };
  }
}