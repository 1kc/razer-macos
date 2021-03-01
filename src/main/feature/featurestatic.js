import { Feature } from './feature';

export class FeatureStatic extends Feature {
  constructor(config) {
    super('static', config);
  }
  getMenuItemFor(device, razerApp) {
    const singleItem = (label, color) => {
      return {
        label: label,
        click() {
          device.setModeStatic(new Uint8Array(color));
        },
      };
    };

    const subMenu = [
      singleItem('Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      this.configuration != null && this.configuration.disabledWhite ? null : singleItem('White', [0xff, 0xff, 0xff]),
      this.configuration != null && this.configuration.disabledRed ? null : singleItem('Red', [0xff, 0, 0]),
      this.configuration != null && this.configuration.disabledGreen? null : singleItem('Green', [0, 0xff, 0]),
      this.configuration != null && this.configuration.disabledBlue ? null : singleItem('Blue', [0, 0, 0xff]),
    ];

    return {
      label: 'Static',
      submenu: subMenu.filter(s => s !== null),
    };
  }
}