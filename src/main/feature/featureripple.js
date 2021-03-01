import { Feature } from './feature';

export class FeatureRipple extends Feature {
  constructor(config) {
    super('ripple', config);
  }
  getMenuItemFor(device, razerApp) {
    const singleItem = (label, color, backgroundColor) => {
      return {
        label: label,
        click() {
          device.setRippleEffect(color, backgroundColor);
        },
      };
    };

    return {
      label: 'Ripple',
      submenu: [
        singleItem('Custom color', Object.values(device.settings.customColor1.rgb).slice(0, 3)),
        singleItem('Custom dual color',
          Object.values(device.settings.customColor1.rgb).slice(0, 3),
          Object.values(device.settings.customColor2.rgb).slice(0, 3),
        ),
        singleItem('Red', [0xff, 0, 0]),
        singleItem('Green', [0, 0xff, 0]),
        singleItem('Blue', [0, 0, 0xff]),
      ],
    };
  }
}