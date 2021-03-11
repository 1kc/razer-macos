import { RazerDeviceAnimation } from './animation';

export class RazerAnimationRipple extends RazerDeviceAnimation {

  constructor(device, color, backgroundColor = [0, 0, 0]) {
    super();
    this.KEY_MAPPING = {
      1: [0, 1],
      59: [0, 3],
      60: [0, 4],
      61: [0, 5],
      62: [0, 6],
      63: [0, 7],
      64: [0, 8],
      65: [0, 9],
      66: [0, 10],
      67: [0, 11],
      68: [0, 12],
      87: [0, 13],
      88: [0, 14],
      91: [0, 15],
      92: [0, 16],
      93: [0, 17],
      57378: [0, 19],
      57376: [0, 21],
      41: [1, 1],
      2: [1, 2],
      3: [1, 3],
      4: [1, 4],
      5: [1, 5],
      6: [1, 6],
      7: [1, 7],
      8: [1, 8],
      9: [1, 9],
      10: [1, 10],
      11: [1, 11],
      12: [1, 12],
      13: [1, 13],
      14: [1, 14],
      3666: [1, 15],
      3655: [1, 16],
      3657: [1, 17],
      69: [1, 18],
      3637: [1, 19],
      55: [1, 20],
      74: [1, 21],
      15: [2, 1],
      16: [2, 2],
      17: [2, 3],
      18: [2, 4],
      19: [2, 5],
      20: [2, 6],
      21: [2, 7],
      22: [2, 8],
      23: [2, 9],
      24: [2, 10],
      25: [2, 11],
      26: [2, 12],
      27: [2, 13],
      43: [2, 14],
      3667: [2, 15],
      3663: [2, 16],
      3665: [2, 17],
      71: [2, 18],
      72: [2, 19],
      73: [2, 20],
      78: [2, 21],
      58: [3, 1],
      30: [3, 2],
      31: [3, 3],
      32: [3, 4],
      33: [3, 5],
      34: [3, 6],
      35: [3, 7],
      36: [3, 8],
      37: [3, 9],
      38: [3, 10],
      39: [3, 11],
      40: [3, 12],
      28: [3, 14],
      75: [3, 18],
      76: [3, 19],
      77: [3, 20],
      42: [4, 1],
      44: [4, 3],
      45: [4, 4],
      46: [4, 5],
      47: [4, 6],
      48: [4, 7],
      49: [4, 8],
      50: [4, 9],
      51: [4, 10],
      52: [4, 11],
      53: [4, 12],
      54: [4, 14],
      57416: [4, 16],
      79: [4, 18],
      80: [4, 19],
      81: [4, 20],
      3612: [4, 21],
      29: [5, 1],
      3675: [5, 2],
      56: [5, 3],
      57: [5, 7],
      3640: [5, 11],
      0: [5, 13],
      3613: [5, 14],
      57419: [5, 15],
      57424: [5, 16],
      57421: [5, 17],
      82: [5, 19],
      83: [5, 20],
    };
    this.rippleEffectInterval = null;

    this.color = color;
    this.backgroundColor = backgroundColor;

    this.device = device;
    this.ioHook = require('iohook');
  }

  start() {
    this.ioHook.start();

    const nRows = 6;
    const nCols = 22;
    const refreshRate = 0.05; // in seconds
    const eventDuration = 1; // in seconds
    const speed = 20; // number of keys per second
    const width = 2; // number of keys

    // initialization
    let matrix = Array(nRows)
      .fill()
      .map(() => Array(nCols).fill(this.backgroundColor));
    for (let i = 0; i < nRows; i++) {
      let row = [i, 0, nCols - 1, ...matrix[i].flat()];
      this.device.setCustomFrame(new Uint8Array(row))
    }
    this.device.setModeCustom();
    let keyEvents = [];

    // keyboard listener
    this.ioHook.on('keydown', (event) => {
      if (!(event.keycode in this.KEY_MAPPING)) return;
      const rowIdx = this.KEY_MAPPING[event.keycode][0];
      const colIdx = this.KEY_MAPPING[event.keycode][1];

      keyEvents.push({
        rowIdx,
        colIdx,
        startTime: Date.now() / 1000,
      });
    });

    this.rippleEffectInterval = setInterval(() => {
      keyEvents = keyEvents.filter((event) => event.startTime + eventDuration > Date.now() / 1000);

      // clear keyboard
      matrix = Array(nRows)
        .fill()
        .map(() => Array(nCols).fill(this.backgroundColor));

      // set color
      for (let i = 0; i < nRows; i++) {
        for (let j = 0; j < nCols; j++) {
          for (let event of keyEvents) {
            const radius = (Date.now() / 1000 - event.startTime) * speed;
            const distance = Math.sqrt(
              Math.pow(event.rowIdx - i, 2) + Math.pow(event.colIdx - j, 2),
            );
            if (radius - width <= distance && distance <= radius) {
              matrix[i][j] = this.color;
              break;
            }
          }
        }
      }

      // set ripple effect
      for (let i = 0; i < nRows; i++) {
        let row = [i, 0, nCols - 1, ...matrix[i].flat()];
        this.device.setCustomFrame(new Uint8Array(row));
      }
      this.device.setModeCustom();
    }, refreshRate);
  }

  stop() {
    clearTimeout(this.rippleEffectInterval);
    this.ioHook.stop();
  }

  destroy() {
    this.stop();
    this.ioHook.unload();
  }
}