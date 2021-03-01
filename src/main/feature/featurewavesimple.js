import { Feature } from './feature';

export class FeatureWaveSimple extends Feature {
  constructor(config) {
    super('waveSimple', config);
  }
  getMenuItemFor(device, razerApp) {
    return {
      label: 'Wave',
      submenu: [
        {
          label: 'Left',
          click() {
            device.setWaveSimple('left');
          },
        },
        {
          label: 'Right',
          click() {
            device.setWaveSimple('right');
          },
        },
      ],
    };
  }
}