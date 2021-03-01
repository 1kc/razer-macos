import { Feature } from './feature';

export class FeatureBreathe extends Feature {
  constructor(config) {
    super('breathe', config);
  }
  getMenuItemFor(device, razerApp) {
    return {
      label: 'Breathe',
      click() {
        // random
        device.setBreathe(new Uint8Array([0]));
      },
    };
  }
}