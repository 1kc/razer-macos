import { Feature } from './feature';

export class FeatureWaveExtended extends Feature {
  constructor(config) {
    super('waveExtended', config);
  }
  getMenuItemFor(device, razerApp) {
    const singleItem = (label, directionSpeed) => {
      return {
        label: label,
        click() {
          device.setWaveExtended(directionSpeed);
        },
      };
    };

    const menuFor = (direction) => {
      return [
        singleItem('Turtle Speed', direction + '_turtle'),
        singleItem('Slowest Speed', direction + '_slowest'),
        singleItem('Slower Speed', direction + '_slower'),
        singleItem('Slow Speed', direction + '_slow'),
        singleItem('Normal Speed', direction + '_default'),
        singleItem('Fast Speed', direction + '_fast'),
        singleItem('Faster Speed', direction + '_faster'),
        singleItem('Fastest Speed', direction + '_fastest'),
        singleItem('Lightning Speed', direction + '_lightning'),
      ];
    };

    return {
      label: 'Wave',
      submenu: [
        {
          label: 'Left',
          submenu: menuFor('left'),
        },
        {
          label: 'Right',
          submenu: menuFor('right'),
        },
      ],
    };
  }
}