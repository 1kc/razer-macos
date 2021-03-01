import { Feature } from './feature';

export class FeatureReactive extends Feature {
  constructor(config) {
    super('reactive', config);
  }
  getMenuItemFor(device, razerApp) {
    const singleItem = (label, colorMode) => {
      return {
        label: label,
        click() {
          device.setReactive(new Uint8Array(colorMode));
        },
      };
    };
    return {
      label: 'Reactive',
      submenu: [
        singleItem('Custom color', [3, device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
        singleItem('Red', [3, 0xff, 0, 0]),
        singleItem('Green', [3, 0, 0xff, 0]),
        singleItem('Blue', [3, 0, 0, 0xff]),
      ],
    };
  }
}