'use strict';

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import addon from '../driver';
import path from 'path';
import { format as formatUrl } from 'url';
import ioHook from 'iohook';

const APP_VERSION = require('../../package.json').version;

const storage = require('electron-json-storage');

const isDevelopment = process.env.NODE_ENV == 'development';

let tray = null;
let window = null;
let forceQuit = false;

let customKdbColor = null;
let customKdbColor2 = null;
let customMouseColor = null;
let customMouseDockColor = null;
let customMouseMatColor = null;
let customEgpuColor = null;
let customHeadphoneColor = null;
let customAccessoryColor = null;
let cycleColors = null;

const KEY_MAPPING = {
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

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
}

function loadItemsFromStorage() {
  storage.get('customKdbColor', function (error, data) {
    if (error) throw error;
    customKdbColor = data;
    if (isEmpty(customKdbColor)) {
      customKdbColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });
  storage.get('customKdbColor2', function (error, data) {
    if (error) throw error;
    customKdbColor2 = data;
    if (isEmpty(customKdbColor2)) {
      customKdbColor2 = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });
  storage.get('customMouseColor', function (error, data) {
    if (error) throw error;

    customMouseColor = data;
    if (isEmpty(customMouseColor)) {
      customMouseColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('customEgpuColor', function (error, data) {
    if (error) throw error;

    customEgpuColor = data;
    if (isEmpty(customEgpuColor)) {
      customEgpuColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('customMouseDockColor', function (error, data) {
    if (error) throw error;

    customMouseDockColor = data;
    if (isEmpty(customMouseDockColor)) {
      customMouseDockColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('customMouseMatColor', function (error, data) {
    if (error) throw error;

    customMouseMatColor = data;
    if (isEmpty(customMouseMatColor)) {
      customMouseMatColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('customHeadphoneColor', function (error, data) {
    if (error) throw error;

    customHeadphoneColor = data;
    if (isEmpty(customHeadphoneColor)) {
      customHeadphoneColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('customAccessoryColor', function (error, data) {
    if (error) throw error;

    customAccessoryColor = data;
    if (isEmpty(customAccessoryColor)) {
      customAccessoryColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0,
        },
      };
    }
  });

  storage.get('cycleColors', function (error, data) {
    if (error) throw error;

    cycleColors = data;
    if (isEmpty(cycleColors)) {
      cycleColors = [
        { r: 0xff, g: 0x00, b: 0x00 },
        { r: 0x00, g: 0xff, b: 0x00 },
        { r: 0x00, g: 0x00, b: 0xff },
      ];
    }

    // this is the last item to load, finish app startup
    itemsLoadedFromStorage();
  });
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}
function rgbToHex({ r, g, b }) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let spectrumColors = [
  { r: 0xff, g: 0x00, b: 0x00 },
  { r: 0xff, g: 0x77, b: 0x00 },
  { r: 0xff, g: 0xff, b: 0x00 },
  { r: 0x77, g: 0xff, b: 0x00 },
  { r: 0x00, g: 0xff, b: 0x00 },
  { r: 0x00, g: 0xff, b: 0x77 },
  { r: 0x00, g: 0xff, b: 0xff },
  { r: 0x00, g: 0x77, b: 0xff },
  { r: 0x00, g: 0x00, b: 0xff },
  { r: 0x77, g: 0x00, b: 0xff },
  { r: 0xff, g: 0x00, b: 0xff },
  { r: 0xff, g: 0x00, b: 0x77 },
];
let cycleColorsIndex = 0;
let cycleColorsInterval = null;
function setDevicesCycleColors(colors) {
  addon.kbdSetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.mouseSetLogoModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.mouseDockSetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.mouseMatSetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.egpuSetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.headphoneSetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );
  addon.accessorySetModeStaticNoStore(
    new Uint8Array([
      colors[cycleColorsIndex].r,
      colors[cycleColorsIndex].g,
      colors[cycleColorsIndex].b,
    ])
  );

  cycleColorsIndex++;
  if (cycleColorsIndex >= colors.length) cycleColorsIndex = 0;
}

let mainMenu = [
  {
    label: 'Refresh Device List',
    click() {
      refreshDevices();
      refreshTray();
    },
  },
  { type: 'separator' },
  {
    label: 'Spectrum All Devices',
    click() {
      // manually use an interval so that all devices are gauranteed in sync.
      // with normal spectrum each device's spectrum can vary slightly causing a mismatched look.
      // must set interval to 4 seconds or the change can look too abrupt.

      clean();
      cycleColorsIndex = 0;
      setDevicesCycleColors(spectrumColors);
      cycleColorsInterval = setInterval(
        setDevicesCycleColors,
        4000,
        spectrumColors
      );
    },
  },
  {
    label: 'Cycle All Devices',
  },
];

function buildCustomColorsCycleMenu() {
  let cccMenu = [
    {
      label: 'Cycle All Devices',
      click() {
        clean();
        cycleColorsIndex = 0;
        setDevicesCycleColors(cycleColors);
        cycleColorsInterval = setInterval(
          setDevicesCycleColors,
          4000,
          cycleColors
        );
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        cycleColors = cycleColors.concat({ r: 0x00, g: 0xff, b: 0x00 });
        storage.set('cycleColors', cycleColors);
        refreshTray();
      },
    },
    {
      label: 'Reset Colors',
      click() {
        cycleColors = [
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ];
        storage.set('cycleColors', cycleColors);
        refreshTray();
      },
    },
    { type: 'separator' },
  ];

  let index = 0;
  cycleColors.forEach((element) => {
    let colorMenuItem = {
      label: 'Color ' + (index + 1),
      indexValue: index,
      click: (event) => setCustomCycleColor(event.indexValue),
    };
    cccMenu = cccMenu.concat(colorMenuItem);

    index++;
  });

  mainMenu[3].submenu = cccMenu;
}

function setCustomCycleColor(index) {
  window.webContents.send('device-selected', {
    device: 'Cycle Color ' + (index + 1),
    currentColor: {
      hex: rgbToHex(cycleColors[index]),
      rgb: cycleColors[index],
    },
  });
  window.show();
}

let keyboardMenu = [
  { type: 'separator' },
  {
    label: 'No keyboard found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.kbdSetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.kbdSetModeStatic(
            new Uint8Array([
              customKdbColor.rgb.r,
              customKdbColor.rgb.g,
              customKdbColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.kbdSetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.kbdSetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.kbdSetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.kbdSetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        submenu: [
          {
            label: 'Turtle Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_turtle');
            },
          },
          {
            label: 'Slowest Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_slowest');
            },
          },
          {
            label: 'Slower Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_slower');
            },
          },
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_slow');
            },
          },
          {
            label: 'Normal Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_default');
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_fast');
            },
          },
          {
            label: 'Faster Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_faster');
            },
          },
          {
            label: 'Fastest Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_fastest');
            },
          },
          {
            label: 'Lightning Speed',
            click() {
              clean();
              addon.kbdSetModeWave('left_lightning');
            },
          },
        ],
      },
      {
        label: 'Right',
        submenu: [
          {
            label: 'Turtle Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_turtle');
            },
          },
          {
            label: 'Slowest Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_slowest');
            },
          },
          {
            label: 'Slower Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_slower');
            },
          },
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_slow');
            },
          },

          {
            label: 'Normal Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_default');
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_fast');
            },
          },
          {
            label: 'Faster Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_faster');
            },
          },
          {
            label: 'Fastest Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_fastest');
            },
          },
          {
            label: 'Lightning Speed',
            click() {
              clean();
              addon.kbdSetModeWave('right_lightning');
            },
          },
        ],
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.kbdSetModeSpectrum();
    },
  },
  {
    label: 'Reactive',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.kbdSetModeReactive(
            new Uint8Array([
              3,
              customKdbColor.rgb.r,
              customKdbColor.rgb.g,
              customKdbColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.kbdSetModeReactive(new Uint8Array([3, 0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.kbdSetModeReactive(new Uint8Array([3, 0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.kbdSetModeReactive(new Uint8Array([3, 0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.kbdSetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Starlight',
    submenu: [
      {
        label: 'Custom color',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  3,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                ])
              );
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  2,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                ])
              );
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  1,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                ])
              );
            },
          },
        ],
      },
      {
        label: 'Custom dual color',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  3,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                  customKdbColor2.rgb.r,
                  customKdbColor2.rgb.g,
                  customKdbColor2.rgb.b,
                ])
              );
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  2,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                  customKdbColor2.rgb.r,
                  customKdbColor2.rgb.g,
                  customKdbColor2.rgb.b,
                ])
              );
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([
                  1,
                  customKdbColor.rgb.r,
                  customKdbColor.rgb.g,
                  customKdbColor.rgb.b,
                  customKdbColor2.rgb.r,
                  customKdbColor2.rgb.g,
                  customKdbColor2.rgb.b,
                ])
              );
            },
          },
        ],
      },
      {
        label: 'Random',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1]));
            },
          },
        ],
      },
      {
        label: 'Red',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0xff, 0, 0]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0xff, 0, 0]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0xff, 0, 0]));
            },
          },
        ],
      },
      {
        label: 'Green',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0, 0xff, 0]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0, 0xff, 0]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0, 0xff, 0]));
            },
          },
        ],
      },
      {
        label: 'Blue',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0, 0, 0xff]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0, 0, 0xff]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0, 0, 0xff]));
            },
          },
        ],
      },
      {
        label: 'Purple',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0x80, 0, 0x80]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0x80, 0, 0x80]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0x80, 0, 0x80]));
            },
          },
        ],
      },
      {
        label: 'Aqua',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0, 0xff, 0xff]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0, 0xff, 0xff]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0, 0xff, 0xff]));
            },
          },
        ],
      },
      {
        label: 'Orange',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([3, 0xff, 0x45, 0]));
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([2, 0xff, 0x45, 0]));
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(new Uint8Array([1, 0xff, 0x45, 0]));
            },
          },
        ],
      },

      {
        label: 'Red and Green',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([3, 0xff, 0, 0, 0, 0xff, 0])
              ); //red + green
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([2, 0xff, 0, 0, 0, 0xff, 0])
              ); //red + green
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([1, 0xff, 0, 0, 0, 0xff, 0])
              ); //red + green
            },
          },
        ],
      },
      {
        label: 'Red and Blue',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([3, 0xff, 0, 0, 0, 0, 0xff])
              ); //red + blue
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([2, 0xff, 0, 0, 0, 0, 0xff])
              ); //red + blue
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([1, 0xff, 0, 0, 0, 0, 0xff])
              ); //red + blue
            },
          },
        ],
      },
      {
        label: 'Blue and Green',
        submenu: [
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([3, 0, 0, 0xff, 0, 0xff, 0])
              ); //blue + green
            },
          },
          {
            label: 'Medium Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([2, 0, 0, 0xff, 0, 0xff, 0])
              ); //blue + green
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.kbdSetModeStarlight(
                new Uint8Array([1, 0, 0, 0xff, 0, 0xff, 0])
              ); //blue + green
            },
          },
        ],
      },
    ],
  },
  {
    label: 'Ripple',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          setRippleEffect(Object.values(customKdbColor.rgb).slice(0, 3));
        },
      },
      {
        label: 'Custom dual color',
        click() {
          clean();
          setRippleEffect(
            Object.values(customKdbColor.rgb).slice(0, 3),
            Object.values(customKdbColor2.rgb).slice(0, 3)
          );
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          setRippleEffect([0xff, 0, 0]);
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          setRippleEffect([0, 0xff, 0]);
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          setRippleEffect([0, 0, 0xff]);
        },
      },
    ],
  },
  {
    label: 'Brightness',
    submenu: [
      {
        label: 'Brightness info not found',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Set to 0%',
        click() {
          clean();
          addon.KbdSetBrightness(0);
          refreshTray();
        },
      },
      {
        label: 'Set to 100%',
        click() {
          clean();
          addon.KbdSetBrightness(100);
          refreshTray();
        },
      },
    ],
  },
  {
    label: 'Keyboard custom settings',
    click() {
      const currentBrightness = addon.KbdGetBrightness();
      window.webContents.send('device-selected', {
        device: 'Keyboard',
        currentColor: customKdbColor,
        currentColor2: customKdbColor2,
        // getBrightness could give -1 when not keyboard not detected
        currentBrightness: currentBrightness < 0 ? 0 : currentBrightness,
      });
      window.setSize(500, 450);
      window.show();
    },
  },
];

let mouseMenu = [
  { type: 'separator' },
  {
    label: 'No mouse found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.mouseSetLogoModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.mouseSetLogoModeStatic(
            new Uint8Array([
              customMouseColor.rgb.r,
              customMouseColor.rgb.g,
              customMouseColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.mouseSetLogoModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.mouseSetLogoModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.mouseSetLogoModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.mouseSetLogoModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() {
          clean();
          addon.mouseSetLogoModeWave('left');
        },
      },
      {
        label: 'Right',
        click() {
          clean();
          addon.mouseSetLogoModeWave('right');
        },
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.mouseSetLogoModeSpectrum();
    },
  },
  {
    label: 'Reactive', // Speed currently defaults to 3 until we add speed controls
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.mouseSetLogoModeReactive(
            new Uint8Array([
              3,
              customMouseColor.rgb.r,
              customMouseColor.rgb.g,
              customMouseColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.mouseSetLogoModeReactive(new Uint8Array([3, 0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.mouseSetLogoModeReactive(new Uint8Array([3, 0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.mouseSetLogoModeReactive(new Uint8Array([3, 0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.mouseSetLogoModeReactive(new Uint8Array([3, 0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.mouseSetLogoModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Older model effects',
    submenu: [
      {
        label: 'Static',
        click() {
          clean();
          addon.mouseSetLogoLEDEffect('static');
        },
      },
      {
        label: 'Blinking',
        click() {
          clean();
          addon.mouseSetLogoLEDEffect('blinking');
        },
      },
      {
        label: 'Pulsate',
        click() {
          clean();
          addon.mouseSetLogoLEDEffect('pulsate');
        },
      },
      {
        label: 'Scroll',
        click() {
          clean();
          addon.mouseSetLogoLEDEffect('scroll');
        },
      },
    ],
  },
  {
    label: 'Mouse custom settings',
    click() {
      window.webContents.send('device-selected', {
        device: 'Mouse',
        currentColor: customMouseColor,
        currentSensitivity: addon.mouseGetDpi(),
      });
      window.setSize(500, 480);
      window.show();
    },
  },
];

let mouseDockMenu = [
  { type: 'separator' },
  {
    label: 'No mouse dock found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.mouseDockSetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.mouseDockSetModeStatic(
            new Uint8Array([
              customMouseDockColor.rgb.r,
              customMouseDockColor.rgb.g,
              customMouseDockColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.mouseDockSetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.mouseDockSetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.mouseDockSetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.mouseDockSetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.mouseDockSetModeSpectrum();
    },
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.mouseDockSetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {
        device: 'Mouse Dock',
        currentColor: customMouseDockColor,
      });
      window.setSize(500, 300);
      window.show();
    },
  },
];

let mouseMatMenu = [
  { type: 'separator' },
  {
    label: 'No mouse mat found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.mouseMatSetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.mouseMatSetModeStatic(
            new Uint8Array([
              customMouseMatColor.rgb.r,
              customMouseMatColor.rgb.g,
              customMouseMatColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.mouseMatSetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.mouseMatSetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.mouseMatSetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.mouseMatSetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() {
          clean();
          addon.mouseMatSetModeWave('left');
        },
      },
      {
        label: 'Right',
        click() {
          clean();
          addon.mouseMatSetModeWave('right');
        },
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.mouseMatSetModeSpectrum();
    },
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.mouseMatSetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {
        device: 'Mouse Mat',
        currentColor: customMouseMatColor,
      });
      window.setSize(500, 400);
      window.show();
    },
  },
];

let egpuMenu = [
  { type: 'separator' },
  {
    label: 'No egpu found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.egpuSetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.egpuSetModeStatic(
            new Uint8Array([
              customEgpuColor.rgb.r,
              customEgpuColor.rgb.g,
              customEgpuColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.egpuSetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.egpuSetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.egpuSetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.egpuSetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() {
          clean();
          addon.egpuSetModeWave('left');
        },
      },
      {
        label: 'Right',
        click() {
          clean();
          addon.egpuSetModeWave('right');
        },
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.egpuSetModeSpectrum();
    },
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.egpuSetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {
        device: 'eGPU',
        currentColor: customEgpuColor,
      });
      window.setSize(500, 300);
      window.show();
    },
  },
];

let headphoneMenu = [
  { type: 'separator' },
  {
    label: 'No headphone found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.headphoneSetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.headphoneSetModeStatic(
            new Uint8Array([
              customHeadphoneColor.rgb.r,
              customHeadphoneColor.rgb.g,
              customHeadphoneColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.headphoneSetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.headphoneSetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.headphoneSetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.headphoneSetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.headphoneSetModeSpectrum();
    },
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.headphoneSetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {
        device: 'Headphone',
        currentColor: customHeadphoneColor,
      });
      window.setSize(500, 300);
      window.show();
    },
  },
];

let accessoryMenu = [
  { type: 'separator' },
  {
    label: 'No accessory found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() {
      clean();
      addon.accessorySetModeNone();
    },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clean();
          addon.accessorySetModeStatic(
            new Uint8Array([
              customAccessoryColor.rgb.r,
              customAccessoryColor.rgb.g,
              customAccessoryColor.rgb.b,
            ])
          );
        },
      },
      {
        label: 'White',
        click() {
          clean();
          addon.accessorySetModeStatic(new Uint8Array([0xff, 0xff, 0xff]));
        },
      },
      {
        label: 'Red',
        click() {
          clean();
          addon.accessorySetModeStatic(new Uint8Array([0xff, 0, 0]));
        },
      },
      {
        label: 'Green',
        click() {
          clean();
          addon.accessorySetModeStatic(new Uint8Array([0, 0xff, 0]));
        },
      },
      {
        label: 'Blue',
        click() {
          clean();
          addon.accessorySetModeStatic(new Uint8Array([0, 0, 0xff]));
        },
      },
    ],
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        submenu: [
          {
            label: 'Turtle Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_turtle');
            },
          },
          {
            label: 'Slowest Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_slowest');
            },
          },
          {
            label: 'Slower Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_slower');
            },
          },
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_slow');
            },
          },
          {
            label: 'Normal Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_default');
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_fast');
            },
          },
          {
            label: 'Faster Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_faster');
            },
          },
          {
            label: 'Fastest Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_fastest');
            },
          },
          {
            label: 'Lightning Speed',
            click() {
              clean();
              addon.accessorySetModeWave('left_lightning');
            },
          },
        ],
      },
      {
        label: 'Right',
        submenu: [
          {
            label: 'Turtle Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_turtle');
            },
          },
          {
            label: 'Slowest Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_slowest');
            },
          },
          {
            label: 'Slower Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_slower');
            },
          },
          {
            label: 'Slow Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_slow');
            },
          },

          {
            label: 'Normal Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_default');
            },
          },
          {
            label: 'Fast Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_fast');
            },
          },
          {
            label: 'Faster Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_faster');
            },
          },
          {
            label: 'Fastest Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_fastest');
            },
          },
          {
            label: 'Lightning Speed',
            click() {
              clean();
              addon.accessorySetModeWave('right_lightning');
            },
          },
        ],
      },
    ],
  },
  {
    label: 'Spectrum',
    click() {
      clean();
      addon.accessorySetModeSpectrum();
    },
  },
  {
    label: 'Breathe',
    click() {
      clean();
      addon.accessorySetModeBreathe(
        new Uint8Array([
          0, // random
        ])
      );
    },
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {
        device: 'Accessory',
        currentColor: customAccessoryColor,
      });
      window.setSize(500, 300);
      window.show();
    },
  },
];

let mainMenuBottom = [
  { type: 'separator' },
  {
    label: 'About',
    submenu: [
      {
        label: `Version: ${APP_VERSION}`,
        enabled: false,
      },
    ],
  },
  {
    label: 'Quit',
    click() {
      app.quit();
    },
  },
];

let keyboardDeviceName = '';
let keyboardBrightnessLevel = -1;
let mouseDeviceName = '';
let mouseDockDeviceName = '';
let mouseMatDeviceName = '';
let egpuDeviceName = '';
let headphoneDeviceName = '';
let accessoryDeviceName = '';
let mouseBatteryLevel = -1;
let mouseCharging = false;

const refreshDevices = () => {
  // close devices
  addon.closeKeyboardDevice();
  addon.closeMouseDevice();
  addon.closeMouseDockDevice();
  addon.closeMouseMatDevice();
  addon.closeEgpuDevice();
  addon.closeHeadphoneDevice();
  addon.closeAccessoryDevice();

  // get devices
  keyboardDeviceName = addon.getKeyboardDevice();
  keyboardBrightnessLevel = addon.KbdGetBrightness();
  mouseDeviceName = addon.getMouseDevice();
  mouseDockDeviceName = addon.getMouseDockDevice();
  mouseMatDeviceName = addon.getMouseMatDevice();
  egpuDeviceName = addon.getEgpuDevice();
  mouseBatteryLevel = addon.getBatteryLevel();
  mouseCharging = addon.getChargingStatus();
  headphoneDeviceName = addon.getHeadphoneDevice();
  accessoryDeviceName = addon.getAccessoryDevice();
};

app.on('ready', () => {
  loadItemsFromStorage();
});
function itemsLoadedFromStorage() {
  refreshDevices();
  createTray();
  createWindow();
}

app.on('quit', () => {
  addon.closeKeyboardDevice();
  addon.closeMouseDevice();
  addon.closeMouseDockDevice();
  addon.closeMouseMatDevice();
  addon.closeEgpuDevice();
  addon.closeHeadphoneDevice();
  addon.closeAccessoryDevice();
});

nativeTheme.on('updated', () => {
  createTray();
});

// mouse dpi rpc listener
ipcMain.on('request-set-dpi', (event, arg) => {
  const { dpi } = arg;
  addon.mouseSetDpi(dpi);
});

// keyboard brightness rpc listener
ipcMain.on('update-keyboard-brightness', (_, arg) => {
  const { brightness } = arg;
  addon.KbdSetBrightness(brightness);
  refreshTray();
});

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { device, color } = arg;

  if (device.startsWith('Cycle Color ')) {
    let index = Number.parseInt(device.substring(12)) - 1;
    cycleColors[index] = color.rgb;
    storage.set('cycleColors', cycleColors);
  } else {
    switch (device) {
      case 'Keyboard':
        customKdbColor = color;
        storage.set('customKdbColor', customKdbColor);
        break;
      case 'Mouse':
        customMouseColor = color;
        storage.set('customMouseColor', customMouseColor);
        break;
      case 'Mouse Dock':
        customMouseDockColor = color;
        storage.set('customMouseDockColor', customMouseDockColor);
        break;
      case 'Mouse Mat':
        customMouseMatColor = color;
        storage.set('customMouseMatColor', customMouseMatColor);
        break;
      case 'eGPU':
        customEgpuColor = color;
        storage.set('customEgpuColor', customEgpuColor);
        break;
      case 'Headphone':
        customHeadphoneColor = color;
        storage.set('customHeadphoneColor', customHeadphoneColor);
        break;
      case 'Accessory':
        customAccessoryColor = color;
        storage.set('customAccessoryColor', customAccessoryColor);
        break;
      default:
    }
  }
});
ipcMain.on('request-set-custom-color2', (event, arg) => {
  const { color } = arg;
  customKdbColor2 = color;
  storage.set('customKdbColor2', customKdbColor2);
});

function createWindow() {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 450, // This is adjusted later with window.setSize
    resizable: false,
    width: 500,
    y: 100,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: '#202124',
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
  });
  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    window.resizable = true;
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }
  window.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    window.on('close', function (e) {
      if (!forceQuit) {
        e.preventDefault();
        window.hide();
      }
    });

    app.on('activate', () => {
      window.show();
    });

    app.on('before-quit', () => {
      forceQuit = true;
    });

    if (isDevelopment) {
      // auto-open dev tools
      window.webContents.openDevTools();

      // add inspect element on right click menu
      window.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              window.inspectElement(props.x, props.y);
            },
          },
        ]).popup(window);
      });
    }
  });
}

function createTray() {
  if (!isDevelopment) {
    if (app.dock) app.dock.hide();

    if (tray != null) {
      tray.destroy();
    }
  }

  // *Template.png will be automatically inverted by electron: https://www.electronjs.org/docs/api/native-image#template-image
  tray = new Tray(path.join(__static, '/assets/iconTemplate.png'));

  refreshTray();
}

function refreshTray() {
  buildCustomColorsCycleMenu();

  // generate menu based on found devices
  let menu = mainMenu;
  if (keyboardDeviceName) {
    keyboardMenu[1].label = keyboardDeviceName;
    keyboardBrightnessLevel = addon.KbdGetBrightness();
    keyboardMenu[11].submenu[0].label = `Brightness: ${keyboardBrightnessLevel}%`;
    menu = menu.concat(keyboardMenu);
  }
  if (mouseDeviceName) {
    if (mouseBatteryLevel == -1) {
      mouseMenu[1].label = mouseDeviceName;
    } else if (mouseCharging) {
      mouseMenu[1].label = mouseDeviceName.concat(
        ' - ⚡'.concat(mouseBatteryLevel.toString().concat('%'))
      );
    } else {
      mouseMenu[1].label = mouseDeviceName.concat(
        ' - 🔋'.concat(mouseBatteryLevel.toString().concat('%'))
      );
    }
    menu = menu.concat(mouseMenu);
  }
  if (mouseDockDeviceName) {
    mouseDockMenu[1].label = mouseDockDeviceName;
    menu = menu.concat(mouseDockMenu);
  }
  if (mouseMatDeviceName) {
    mouseMatMenu[1].label = mouseMatDeviceName;
    menu = menu.concat(mouseMatMenu);
  }
  if (egpuDeviceName) {
    egpuMenu[1].label = egpuDeviceName;
    menu = menu.concat(egpuMenu);
  }
  if (headphoneDeviceName) {
    headphoneMenu[1].label = headphoneDeviceName;
    menu = menu.concat(headphoneMenu);
  }
  if (accessoryDeviceName) {
    accessoryMenu[1].label = accessoryDeviceName;
    menu = menu.concat(accessoryMenu);
  }
  menu = menu.concat(mainMenuBottom);

  const contextMenu = Menu.buildFromTemplate(menu);
  tray.setToolTip('Razer macOS menu');
  tray.setContextMenu(contextMenu);
}

let rippleEffectInterval = null;
function setRippleEffect(color, backgroundColor = [0, 0, 0]) {
  ioHook.start();

  const nRows = 6;
  const nCols = 22;
  const refreshRate = 0.05; // in seconds
  const eventDuration = 1; // in seconds
  const speed = 20; // number of keys per second
  const width = 2; // number of keys

  // initialization
  let matrix = Array(nRows)
    .fill()
    .map(() => Array(nCols).fill(backgroundColor));
  for (let i = 0; i < nRows; i++) {
    let row = [i, 0, nCols - 1, ...matrix[i].flat()];
    addon.kbdSetCustomFrame(new Uint8Array(row));
  }
  addon.kbdSetModeCustom();
  let keyEvents = [];

  // keyboard listener
  ioHook.on('keydown', (event) => {
    if (!(event.keycode in KEY_MAPPING)) return;
    const rowIdx = KEY_MAPPING[event.keycode][0];
    const colIdx = KEY_MAPPING[event.keycode][1];

    keyEvents.push({
      rowIdx,
      colIdx,
      startTime: Date.now() / 1000,
    });
  });

  rippleEffectInterval = setInterval(function () {
    keyEvents = keyEvents.filter(
      (event) => event.startTime + eventDuration > Date.now() / 1000
    );

    // clear keyboard
    matrix = Array(nRows)
      .fill()
      .map(() => Array(nCols).fill(backgroundColor));

    // set color
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        for (let event of keyEvents) {
          const radius = (Date.now() / 1000 - event.startTime) * speed;
          const distance = Math.sqrt(
            Math.pow(event.rowIdx - i, 2) + Math.pow(event.colIdx - j, 2)
          );
          if (radius - width <= distance && distance <= radius) {
            matrix[i][j] = color;
            break;
          }
        }
      }
    }

    // set ripple effect
    for (let i = 0; i < nRows; i++) {
      let row = [i, 0, nCols - 1, ...matrix[i].flat()];
      addon.kbdSetCustomFrame(new Uint8Array(row));
    }
    addon.kbdSetModeCustom();
  }, refreshRate);
}

function clean() {
  clearInterval(cycleColorsInterval);
  clearInterval(rippleEffectInterval);
  ioHook.stop();
}
