import { Feature } from './feature';

export class FeatureBrightness extends Feature {
  constructor(config) {
    super('brightness', config);
  }
  getMenuItemFor(device, razerApp) {
    const updateBrightness = (brightness) => {
      device.settings.customBrightness = brightness;
      device.setBrightness(device.settings.customBrightness);
      razerApp.refreshTray();
    };

    return {
      label: 'Brightness',
      submenu: [
        {
          label: `Brightness: ${device.brightness}%`,
        },
        { type: 'separator' },
        {
          label: 'Set to 0%',
          click() {
            updateBrightness(0);
          },
        },
        {
          label: 'Set to 100%',
          click() {
            updateBrightness(100);
          },
        },
      ],
    };
  }
}