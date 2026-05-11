import { RazerDeviceAnimation } from './animation';

export class RazerAnimationFire extends RazerDeviceAnimation {
  constructor(device, featureConfiguration, colors = []) {
    super();
    this.fireEffectInterval = null;

    this.device = device;
    this.nRows = featureConfiguration.rows;
    this.nCols = featureConfiguration.cols;
    this.heat = Array(this.nRows)
      .fill()
      .map(() => Array(this.nCols).fill(0));

    const primaryColor = colors.length >= 3 ? colors.slice(0, 3) : [0xff, 0x45, 0];
    this.primaryColor = this.normalizeColor(primaryColor, [0xff, 0x45, 0]);

    const secondaryColor = colors.length >= 6
      ? colors.slice(3, 6)
      : this.blendColor(this.primaryColor, [0xff, 0xff, 0xff], 0.35);
    this.secondaryColor = this.normalizeColor(secondaryColor, [0xff, 0xb0, 0]);
  }

  start() {
    const refreshRate = 70; // milliseconds

    this.fireEffectInterval = setInterval(() => {
      this.heat = this.nextHeatFrame();
      const matrix = this.heat.map(row => row.map(heat => this.colorForHeat(heat)));

      for (let i = 0; i < this.nRows; i++) {
        let row = [i, 0, this.nCols - 1, ...matrix[i].flat()];
        this.device.setCustomFrame(new Uint8Array(row));
      }
      this.device.setModeCustom();
    }, refreshRate);
  }

  stop() {
    clearInterval(this.fireEffectInterval);
  }

  destroy() {
    this.stop();
  }

  nextHeatFrame() {
    return this.heat.map((row, rowIndex) => {
      return row.map((heat, colIndex) => {
        if (rowIndex === this.nRows - 1) {
          return this.clamp01((heat * 0.35) + (Math.random() * 0.75) + 0.15);
        }

        const sourceRow = Math.min(this.nRows - 1, rowIndex + 1);
        const sourceCol = this.clamp(colIndex + this.randomInt(-1, 1), 0, this.nCols - 1);
        const belowHeat = this.heat[sourceRow][sourceCol];
        const sameHeat = this.heat[rowIndex][colIndex];
        const cooling = (Math.random() * 0.16) + (rowIndex / this.nRows * 0.06);

        return this.clamp01((belowHeat * 0.82) + (sameHeat * 0.08) - cooling);
      });
    });
  }

  colorForHeat(heat) {
    if (heat < 0.08) {
      return [0, 0, 0];
    }
    if (heat < 0.55) {
      return this.blendColor([0, 0, 0], this.primaryColor, heat / 0.55);
    }
    if (heat < 0.9) {
      return this.blendColor(this.primaryColor, this.secondaryColor, (heat - 0.55) / 0.35);
    }
    return this.blendColor(this.secondaryColor, [0xff, 0xf0, 0xc0], (heat - 0.9) / 0.1);
  }

  blendColor(from, to, ratio) {
    const clampedRatio = this.clamp01(ratio);
    return from.map((channel, index) => {
      return Math.round(channel + ((to[index] - channel) * clampedRatio));
    });
  }

  normalizeColor(color, fallback) {
    if (color == null || color.length < 3) {
      return fallback;
    }
    return color.slice(0, 3).map(channel => this.clamp(Math.round(channel), 0, 255));
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  clamp01(value) {
    return this.clamp(value, 0, 1);
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
}
