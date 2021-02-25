import { RazerDeviceAnimation } from './animation';

export class RazerAnimationCycle extends RazerDeviceAnimation {

  constructor(razerApp) {
    super(razerApp);
    this.cycleColorsIndex = 0;
    this.cycleColorsInterval = null;
    this.cycleColors = [];
    this.colorChangeMs = 4000;
  }

  setDevicesCycleColors() {
    this.razerApp.deviceManager.activeRazerDevices.forEach(device => {
      device.setModeStaticNoStore(new Uint8Array([
        this.cycleColors[this.cycleColorsIndex].r,
        this.cycleColors[this.cycleColorsIndex].g,
        this.cycleColors[this.cycleColorsIndex].b,
      ]));
    });

    this.cycleColorsIndex++;
    if (this.cycleColorsIndex >= this.cycleColors.length) {
      this.cycleColorsIndex = 0;
    }
  }

  start() {
    clearInterval(this.cycleColorsInterval);
    this.cycleColorsIndex = 0;
    this.setDevicesCycleColors(this.cycleColors);
    this.cycleColorsInterval = setInterval(() => this.setDevicesCycleColors(), this.colorChangeMs);
  }

  stop() {
    clearInterval(this.cycleColorsInterval);
  }
}