import { RazerDeviceAnimation } from './animation';
import tinycolor from 'tinycolor2';

export class RazerAnimationWheel extends RazerDeviceAnimation {

constructor(device, featureConfiguration, speed) {
    super();
    this.wheelEffectInterval = null;

    this.device = device;

    this.nRows = featureConfiguration.rows;
    this.nCols = featureConfiguration.cols;
    this.speed = speed; // seconds per cycle
  }

  start() {
    const refreshRate = 0.05; // in seconds

    // initialization
    let matrix = Array(this.nRows)
      .fill()
      .map(() => Array(this.nCols).fill([0,0,0]));

    const midRow = parseInt(this.nRows / 2);
    const midCol = parseInt(this.nCols / 2);

    this.wheelEffectInterval = setInterval(() => {

      // set color
      for (let i = 0; i < this.nRows; i++) {
        for (let j = 0; j < this.nCols; j++) {
          let angle = Math.atan((midRow - i) / (j - midCol)) / Math.PI * 180;
          if (j <  midCol) angle += 180;
          if (i == midRow && j == midCol) angle = 0;

          angle += Date.now() % parseInt(this.speed * 1000) / (this.speed * 1000) * 360;
          angle = (angle + 360) % 360;
          matrix[i][j] = Object.values(tinycolor(`hsv(${360-angle},70%,100%)`).toRgb()).slice(0, 3);
        }
      }

      // set wheel effect
      for (let i = 0; i < this.nRows; i++) {
        let row = [i, 0, this.nCols - 1, ...matrix[i].flat()];
        this.device.setCustomFrame(new Uint8Array(row))
      }
      this.device.setModeCustom();
    }, refreshRate);
  }

  stop() {
    clearTimeout(this.wheelEffectInterval);
  }

  destroy() {
    this.stop();
  }
}