'use strict'

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import addon from '../driver'
import path from 'path'
import { format as formatUrl } from 'url'

const storage = require('electron-json-storage');

const isDevelopment = process.env.NODE_ENV == 'development'

let tray = null;
let window = null;
let forceQuit = false;

let customKdbColor = null;
let customMouseColor = null;
let customMouseDockColor = null;
let customMouseMatColor = null;
let customEgpuColor = null;
let customHeadphoneColor = null;
let cycleColors = null;

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
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
          b: 0
        }
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
          b: 0
        }
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
          b: 0
        }
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
          b: 0
        }
      };
    }
  });

  storage.get('customHeadphoneColor', function(error, data) {
    if (error) throw error;

    customHeadphoneColor = data;
    if (isEmpty(customHeadphoneColor)) {
      customHeadphoneColor = {
        hex: '#ffff00',
        rgb: {
          r: 255,
          g: 255,
          b: 0
        }
      };
    }
  });

  storage.get('cycleColors', function(error, data) {
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
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex({ r, g, b }) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
  addon.kbdSetModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));
  addon.mouseSetLogoModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));
  addon.mouseDockSetModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));
  addon.mouseMatSetModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));
  addon.egpuSetModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));
  addon.headphoneSetModeStaticNoStore(new Uint8Array([
    colors[cycleColorsIndex].r, colors[cycleColorsIndex].g, colors[cycleColorsIndex].b
  ]));

  cycleColorsIndex++;
  if (cycleColorsIndex >= colors.length)
    cycleColorsIndex = 0;
}

let mainMenu = [
  {
    label: 'Refresh Device List',
    click() { refreshDevices(); refreshTray(); },
  },
  { type: 'separator' },
  {
    label: 'Spectrum All Devices',
    click() {
      // manually use an interval so that all devices are gauranteed in sync.
      // with normal spectrum each device's spectrum can vary slightly causing a mismatched look.
      // must set interval to 4 seconds or the change can look too abrupt.

      clearInterval(cycleColorsInterval);
      cycleColorsIndex = 0;
      setDevicesCycleColors(spectrumColors);
      cycleColorsInterval = setInterval(setDevicesCycleColors, 4000, spectrumColors);
    },
  },
  {
    label: 'Cycle All Devices',
  },
]

function buildCustomColorsCycleMenu() {
  let cccMenu = [
    {
      label: 'Cycle All Devices',
      click() {
        clearInterval(cycleColorsInterval);
        cycleColorsIndex = 0;
        setDevicesCycleColors(cycleColors);
        cycleColorsInterval = setInterval(setDevicesCycleColors, 4000, cycleColors);
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        cycleColors = cycleColors.concat({ r: 0x00, g: 0xff, b: 0x00 });
        storage.set('cycleColors', cycleColors);
        refreshTray();
      }
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
      }
    },
    { type: 'separator' },
  ]

  let index = 0;
  cycleColors.forEach(element => {
    let colorMenuItem = {
      label: 'Color ' + (index + 1),
      indexValue: index,
      click: event => setCustomCycleColor(event.indexValue),
    };
    cccMenu = cccMenu.concat(colorMenuItem);

    index++;
  });

  mainMenu[3].submenu = cccMenu;
}

function setCustomCycleColor(index) {
  window.webContents.send('device-selected', { device: 'Cycle Color ' + (index + 1), currentColor: { hex: rgbToHex(cycleColors[index]), rgb: cycleColors[index] } });
  window.show()
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
    click() { clearInterval(cycleColorsInterval); addon.kbdSetModeNone(); },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStatic(new Uint8Array([
            customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStatic(new Uint8Array([
            0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStatic(new Uint8Array([
            0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStatic(new Uint8Array([
            0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStatic(new Uint8Array([
            0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(cycleColorsInterval); addon.kbdSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(cycleColorsInterval); addon.kbdSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.kbdSetModeSpectrum(); },
  },
  {
    label: 'Reactive',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeReactive(new Uint8Array([
            3, customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeReactive(new Uint8Array([
            3, 0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeReactive(new Uint8Array([
            3, 0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeReactive(new Uint8Array([
            3, 0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Breathe',
    click() {
      clearInterval(cycleColorsInterval); addon.kbdSetModeBreathe(new Uint8Array([
        0 // random
      ]))
    }
  },
  {
    label: 'Starlight',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStarlight(new Uint8Array([
            3, customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStarlight(new Uint8Array([
            3, 0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStarlight(new Uint8Array([
            3, 0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.kbdSetModeStarlight(new Uint8Array([
            3, 0, 0, 0xff
          ]))
        },
      }
    ]
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', { device: 'Keyboard', currentColor: customKdbColor });
      window.setSize(500, 300);
      window.show();
    }
  },
]

let mouseMenu = [
  { type: 'separator' },
  {
    label: 'No mouse found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.mouseSetLogoModeStatic(new Uint8Array([
            customMouseColor.rgb.r, customMouseColor.rgb.g, customMouseColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
            0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
            0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
            0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
            0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoModeSpectrum(); },
  },
  {
    label: 'Reactive', // Speed currently defaults to 3 until we add speed controls
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.mouseSetLogoModeReactive(new Uint8Array([
            3, customMouseColor.rgb.r, customMouseColor.rgb.g, customMouseColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeReactive(new Uint8Array([
            3, 0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeReactive(new Uint8Array([
            3, 0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeReactive(new Uint8Array([
            3, 0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseSetLogoModeReactive(new Uint8Array([
            3, 0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Breathe',
    click() {
      clearInterval(cycleColorsInterval); addon.mouseSetLogoModeBreathe(new Uint8Array([
        0 // random
      ]))
    }
  },
  {
    label: 'Older model effects',
    submenu: [
      {
        label: 'Static',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoLEDEffect('static'); },
      },
      {
        label: 'Blinking',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoLEDEffect('blinking'); },
      },
      {
        label: 'Pulsate',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoLEDEffect('pulsate'); },
      },
      {
        label: 'Scroll',
        click() { clearInterval(cycleColorsInterval); addon.mouseSetLogoLEDEffect('scroll'); },
      }
    ]
  },
  {
    label: 'Set custom color and DPI',
    click() {
      window.webContents.send('device-selected', { device: 'Mouse', currentColor: customMouseColor, currentSensitivity: addon.mouseGetDpi() });
      window.setSize(500, 420);
      window.show();
    }
  }
]

let mouseDockMenu = [
  { type: 'separator' },
  {
    label: 'No mouse dock found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(cycleColorsInterval); addon.mouseDockSetModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.mouseDockSetModeStatic(new Uint8Array([
            customMouseDockColor.rgb.r, customMouseDockColor.rgb.g, customMouseDockColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseDockSetModeStatic(new Uint8Array([
            0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseDockSetModeStatic(new Uint8Array([
            0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseDockSetModeStatic(new Uint8Array([
            0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseDockSetModeStatic(new Uint8Array([
            0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.mouseDockSetModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() {
      clearInterval(cycleColorsInterval); addon.mouseDockSetModeBreathe(new Uint8Array([
        0 // random
      ]))
    }
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', { device: 'Mouse Dock', currentColor: customMouseDockColor });
      window.setSize(500, 300);
      window.show();
    }
  },
]

let mouseMatMenu = [
  { type: 'separator' },
  {
    label: 'No mouse mat found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(cycleColorsInterval); addon.mouseMatSetModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.mouseMatSetModeStatic(new Uint8Array([
            customMouseMatColor.rgb.r, customMouseMatColor.rgb.g, customMouseMatColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseMatSetModeStatic(new Uint8Array([
            0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseMatSetModeStatic(new Uint8Array([
            0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseMatSetModeStatic(new Uint8Array([
            0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.mouseMatSetModeStatic(new Uint8Array([
            0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(cycleColorsInterval); addon.mouseMatSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(cycleColorsInterval); addon.mouseMatSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.mouseMatSetModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() {
      clearInterval(cycleColorsInterval); addon.mouseMatSetModeBreathe(new Uint8Array([
        0 // random
      ]))
    }
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', { device: 'Mouse Mat', currentColor: customMouseMatColor });
      window.setSize(500, 300);
      window.show();
    }
  },
]

let egpuMenu = [
  { type: 'separator' },
  {
    label: 'No egpu found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(cycleColorsInterval); addon.egpuSetModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.egpuSetModeStatic(new Uint8Array([
            customegpuColor.rgb.r, customegpuColor.rgb.g, customegpuColor.rgb.b
          ]))
        },
      },
      {
        label: 'White',
        click() {
          clearInterval(cycleColorsInterval); addon.egpuSetModeStatic(new Uint8Array([
            0xff, 0xff, 0xff
          ]))
        },
      },
      {
        label: 'Red',
        click() {
          clearInterval(cycleColorsInterval); addon.egpuSetModeStatic(new Uint8Array([
            0xff, 0, 0
          ]))
        },
      },
      {
        label: 'Green',
        click() {
          clearInterval(cycleColorsInterval); addon.egpuSetModeStatic(new Uint8Array([
            0, 0xff, 0
          ]))
        },
      },
      {
        label: 'Blue',
        click() {
          clearInterval(cycleColorsInterval); addon.egpuSetModeStatic(new Uint8Array([
            0, 0, 0xff
          ]))
        },
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(cycleColorsInterval); addon.egpuSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(cycleColorsInterval); addon.egpuSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.egpuSetModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() {
      clearInterval(cycleColorsInterval); addon.egpuSetModeBreathe(new Uint8Array([
        0 // random
      ]))
    }
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', { device: 'Mouse Mat', currentColor: customegpuColor });
      window.setSize(500, 300);
      window.show();
    }
  },
]

let headphoneMenu = [
  { type: 'separator' },
  {
    label: 'No headphone found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(cycleColorsInterval);
          addon.headphoneSetModeStatic(new Uint8Array([
            customHeadphoneColor.rgb.r, customHeadphoneColor.rgb.g, customHeadphoneColor.rgb.b
          ]))},
      },
      {
        label: 'White',
        click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeStatic(new Uint8Array([
          0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() { clearInterval(cycleColorsInterval); addon.headphoneSetModeBreathe(new Uint8Array([
      0 // random
    ]))}
  },
  {
    label: 'Set custom color',
    click() {
      window.webContents.send('device-selected', {device: 'Headphone', currentColor: customHeadphoneColor});
      window.setSize(500, 300);
      window.show();
    }
  }
]

let mainMenuBottom = [
  { type: 'separator' },
  {
    label: 'Quit',
    click() { app.quit(); }
  },
]

let keyboardDeviceName = '';
let mouseDeviceName = '';
let mouseDockDeviceName = '';
let mouseMatDeviceName = '';
let egpuDeviceName = '';
let headphoneDeviceName = '';
let mouseBatteryLevel = -1;
let mouseCharging = false;

const refreshDevices = () => {
  // close devices
  addon.closeKeyboardDevice()
  addon.closeMouseDevice()
  addon.closeMouseDockDevice()
  addon.closeMouseMatDevice()
  addon.closeEgpuDevice()
  addon.closeHeadphoneDevice()

  // get devices
  keyboardDeviceName = addon.getKeyboardDevice();
  mouseDeviceName = addon.getMouseDevice();
  mouseDockDeviceName = addon.getMouseDockDevice();
  mouseMatDeviceName = addon.getMouseMatDevice();
  egpuDeviceName = addon.getEgpuDevice();
  mouseBatteryLevel = addon.getBatteryLevel();
  mouseCharging = addon.getChargingStatus();
  headphoneDeviceName = addon.getHeadphoneDevice();
}

app.on('ready', () => {
  loadItemsFromStorage();
})
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
})

nativeTheme.on('updated', () => {
  createTray();
})

// mouse dpi rpc listener
ipcMain.on('request-set-dpi', (event, arg) => {
  const { dpi } = arg;
  addon.mouseSetDpi(dpi);
})

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { device, color } = arg;

  if (device.startsWith('Cycle Color ')) {
    let index = Number.parseInt(device.substring(12)) - 1;
    cycleColors[index] = color.rgb;
    storage.set('cycleColors', cycleColors);
  }
  else {
    switch (device) {
      case "Keyboard":
        customKdbColor = color;
        storage.set('customKdbColor', customKdbColor);
        break;
      case "Mouse":
        customMouseColor = color;
        storage.set('customMouseColor', customMouseColor);
        break;
      case "Mouse Dock":
        customMouseDockColor = color;
        storage.set('customMouseDockColor', customMouseDockColor);
        break;
      case "Mouse Mat":
        customMouseMatColor = color;
        storage.set('customMouseMatColor', customMouseMatColor);
        break;
      case "eGPU":
        customMouseMatColor = color;
        storage.set('customMouseMatColor', customMouseMatColor);
        break;
      case "Headphone":
        customHeadphoneColor = color;
        storage.set('customHeadphoneColor', customHeadphoneColor);
        break;
      default:
    }
  }
});


function createWindow() {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 300,
    resizable: false,
    width: 500,
    y: 100,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#242424",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
  })
  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    window.resizable = true;
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
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
  })
}

function createTray() {
  if (!isDevelopment) {
    if (app.dock) app.dock.hide();

    if (tray != null) {
      tray.destroy();
    }
  }

  if (nativeTheme.shouldUseDarkColors) {
    tray = new Tray(path.join(__static, '/assets/icon-darkmode.png'));
  } else {
    tray = new Tray(path.join(__static, '/assets/icon-lightmode.png'));
  }

  refreshTray()
}

function refreshTray() {
  buildCustomColorsCycleMenu();

  // generate menu based on found devices
  let menu = mainMenu;
  if (keyboardDeviceName) {
    keyboardMenu[1].label = keyboardDeviceName;
    menu = menu.concat(keyboardMenu);
  }
  if (mouseDeviceName) {
    if (mouseBatteryLevel == -1) {
      mouseMenu[1].label = mouseDeviceName;
    } else if (mouseCharging) {
      mouseMenu[1].label = mouseDeviceName.concat(" - ⚡".concat(mouseBatteryLevel.toString().concat("%")));
    }
    else {
      mouseMenu[1].label = mouseDeviceName.concat(" - 🔋".concat(mouseBatteryLevel.toString().concat("%")));
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
  menu = menu.concat(mainMenuBottom);

  const contextMenu = Menu.buildFromTemplate(menu);
  tray.setToolTip('Razer macOS menu');
  tray.setContextMenu(contextMenu);
}
