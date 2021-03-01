import { Feature } from './feature';

export class FeatureStarlight extends Feature {
  constructor(config) {
    super('starlight', config);
  }
  getMenuItemFor(device, razerApp) {
    const singleItem = (label, speed, colors) => {
      return {
        label: label,
        click() {
          device.setStarlight(new Uint8Array([speed].concat(colors)));
        },
      };
    };

    const menuFor = (colors) => {
      return [
        singleItem('Slow Speed', 3, colors),
        singleItem('Medium Speed', 2, colors),
        singleItem('Fast Speed', 1, colors),
      ];
    };

    return {
      label: 'Starlight',
      submenu: [
        {
          label: 'Custom color',
          submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
        },
        {
          label: 'Custom dual color',
          submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b, device.settings.customColor2.rgb.r, device.settings.customColor2.rgb.g, device.settings.customColor2.rgb.b]),
        },
        {
          label: 'Random',
          submenu: menuFor([]),
        },
        {
          label: 'Red',
          submenu: menuFor([0xff, 0, 0]),
        },
        {
          label: 'Green',
          submenu: menuFor([0, 0xff, 0]),
        },
        {
          label: 'Blue',
          submenu: menuFor([0, 0, 0xff]),
        },
        {
          label: 'Purple',
          submenu: menuFor([0x80, 0, 0x80]),
        },
        {
          label: 'Aqua',
          submenu: menuFor([0, 0xff, 0xff]),
        },
        {
          label: 'Orange',
          submenu: menuFor([0xff, 0x45, 0]),
        },

        {
          label: 'Red and Green',
          submenu: menuFor([0xff, 0, 0, 0, 0xff, 0]),
        },
        {
          label: 'Red and Blue',
          submenu: menuFor([0xff, 0, 0, 0, 0, 0xff]),
        },
        {
          label: 'Blue and Green',
          submenu: menuFor([0, 0, 0xff, 0, 0xff, 0]),
        },
      ],
    };
  }
}