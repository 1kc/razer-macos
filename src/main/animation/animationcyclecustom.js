import { RazerAnimationCycle } from './animationcycle';
import { getKey, hasKey, setKey } from '../settingsmanager';

export class RazerAnimationCycleCustom extends RazerAnimationCycle {

  constructor(razerApp) {
    super(razerApp);
    this.cycleColors = [
      { r: 0xff, g: 0x00, b: 0x00 },
      { r: 0x00, g: 0xff, b: 0x00 },
      { r: 0x00, g: 0x00, b: 0xff },
    ];
  }

  async init() {
    await super.init();
    if (await hasKey('cycleColors')) {
      this.cycleColors = await getKey('cycleColors');
    }
    return this;
  }

  getAllColors() {
    return this.cycleColors;
  }

  getColor(index) {
    return this.cycleColors[index];
  };

  addColor(color) {
    this.cycleColors = this.cycleColors.concat(color);
    return setKey('cycleColors', this.cycleColors);
  }

  setColor(colors) {
    this.cycleColors = colors;
    return setKey('cycleColors', this.cycleColors);
  }
}