import { Feature } from './feature';

export class FeatureOldMouseEffects extends Feature {
  constructor(config) {
    super('oldMouseEffects', config);
  }
  getMenuItemFor(device, razerApp) {

    const submenu = [
      this.configuration != null && this.configuration.disabledStatic ? null : {
        label: 'Static',
        click() {
          device.setLogoLEDEffect('static');
        },
      },
      this.configuration != null && this.configuration.disabledBlinking ? null :{
        label: 'Blinking',
        click() {
          device.setLogoLEDEffect('blinking');
        },
      },
      this.configuration != null && this.configuration.disabledPulsate ? null :{
        label: 'Pulsate',
        click() {
          device.setLogoLEDEffect('pulsate');
        },
      },
      this.configuration != null && this.configuration.disabledScroll ? null :{
        label: 'Scroll',
        click() {
          device.setLogoLEDEffect('scroll');
        },
      },
    ];

    return {
      label: 'Older model effects',
      submenu: submenu.filter(s => s !== null)
    };
  }
}