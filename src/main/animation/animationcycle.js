import { RazerDeviceAnimation } from './animation';

export class RazerAnimationCycle extends RazerDeviceAnimation {

  constructor(razerApp) {
    super();
    this.razerApp = razerApp;
    this.cycleColorsIndex = 0;
    this.cycleColorsInterval = null;
    this.cycleColors = [];
    this.colorChangeMs = 4000;
  }

  setDevicesCycleColors() {
    if (this.cycleColors.length === 0) {
      return;
    }
    this.cycleColorsIndex %= this.cycleColors.length;
    this.razerApp.deviceManager.activeRazerDevices.forEach(device => {
      device.setModeStaticNoStore([
        this.cycleColors[this.cycleColorsIndex].r,
        this.cycleColors[this.cycleColorsIndex].g,
        this.cycleColors[this.cycleColorsIndex].b,
      ]);
    });

    this.cycleColorsIndex++;
    if (this.cycleColorsIndex >= this.cycleColors.length) {
      this.cycleColorsIndex = 0;
    }
  }

  start(resetIndex = true) {
    this.stop();
    if (resetIndex) {
      this.cycleColorsIndex = 0;
    }
    if (this.cycleColors.length === 0) {
      return;
    }
    this.setDevicesCycleColors();
    this.cycleColorsInterval = setInterval(() => this.setDevicesCycleColors(), this.colorChangeMs);
  }

  stop() {
    clearInterval(this.cycleColorsInterval);
    this.cycleColorsInterval = null;
  }
}