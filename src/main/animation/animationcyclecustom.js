import { RazerAnimationCycle } from './animationcycle';

export class RazerAnimationCycleCustom extends RazerAnimationCycle {

  constructor(razerApp) {
    super(razerApp);
    this.settingsKey = 'cycleColors';
    this.cycleColors = [
      { r: 0xff, g: 0x00, b: 0x00 },
      { r: 0x00, g: 0xff, b: 0x00 },
      { r: 0x00, g: 0x00, b: 0xff },
    ];
  }

  async init() {
    await super.init();
    if (await this.razerApp.settingsManager.hasKey(this.settingsKey)) {
      this.cycleColors = await this.razerApp.settingsManager.getKey(this.settingsKey);
    }
    return this;
  }

  getAllColors() {
    return this.cycleColors;
  }

  getColor(index) {
    return this.cycleColors[index];
  }

  updateColor(index, color) {
    this.cycleColors[index] = color;
    return this.saveSettings();
  }

  addColor(color) {
    this.cycleColors = this.cycleColors.concat(color);
    return this.saveSettings();
  }

  setColor(colors) {
    this.cycleColors = colors;
    return this.saveSettings();
  }

  saveSettings() {
    return this.razerApp.settingsManager.setKey(this.settingsKey, this.cycleColors);
  }
}