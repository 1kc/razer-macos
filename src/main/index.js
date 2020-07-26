'use strict'

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import addon from '../driver'
import path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV == 'development'

let tray = null
let window = null
let forceQuit = false;

let customKdbColor = {
  hex: '#ffff00',
  rgb: {
    r: 255,
    g: 255,
    b: 0
  }
};

let customMouseColor = {
  hex: '#ffff00',
  rgb: {
    r: 255,
    g: 255,
    b: 0
  }
};

let customMouseMatColor = {
  hex: '#ffff00',
  rgb: {
    r: 255,
    g: 255,
    b: 0
  }
};

let spectrumInterval = null;
let spectrumColors = [
  {r: 0xff, g: 0x00, b: 0x00},
  {r: 0xff, g: 0x77, b: 0x00},
  {r: 0xff, g: 0xff, b: 0x00},
  {r: 0x77, g: 0xff, b: 0x00},
  {r: 0x00, g: 0xff, b: 0x00},
  {r: 0x00, g: 0xff, b: 0x77},
  {r: 0x00, g: 0xff, b: 0xff},
  {r: 0x00, g: 0x77, b: 0xff},
  {r: 0x00, g: 0x00, b: 0xff},
  {r: 0x77, g: 0x00, b: 0xff},
  {r: 0xff, g: 0x00, b: 0xff},
  {r: 0xff, g: 0x00, b: 0x77},
];
let spectrumColorIndex = 0;
function setDevicesSpectrumColors() {
  addon.kbdSetModeStaticNoStore(new Uint8Array([
    spectrumColors[spectrumColorIndex].r, spectrumColors[spectrumColorIndex].g, spectrumColors[spectrumColorIndex].b
  ]))
  addon.mouseSetLogoModeStaticNoStore(new Uint8Array([
    spectrumColors[spectrumColorIndex].r, spectrumColors[spectrumColorIndex].g, spectrumColors[spectrumColorIndex].b
  ]))
  addon.mouseMatSetModeStaticNoStore(new Uint8Array([
    spectrumColors[spectrumColorIndex].r, spectrumColors[spectrumColorIndex].g, spectrumColors[spectrumColorIndex].b
  ]))

  spectrumColorIndex++;
  if (spectrumColorIndex >= spectrumColors.length)
  spectrumColorIndex = 0;
}

let mainMenu = [
  {
    label: 'Refresh Device List',
    click() { refreshDevices(); refreshTray(); },
  },
  {
    label: 'Spectrum All Devices',
    click() {
      // manually use an interval so that all devices are gauranteed in sync.
      // with normal spectrum each device's spectrum can vary slightly causing a mismatched look.
      // must set interval to 4 seconds or the change can look too abrupt.

      clearInterval(spectrumInterval);
      spectrumColorIndex = 0;
      setDevicesSpectrumColors();
      spectrumInterval = setInterval(setDevicesSpectrumColors, 4000);
    },
  },
]

let keyboardMenu = [
  { type: 'separator' },
  {
    label: 'No keyboard found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'None',
    click() { clearInterval(spectrumInterval); addon.kbdSetModeNone(); },
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStatic(new Uint8Array([
          customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
        ]))},
      },
      {
        label: 'White',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStatic(new Uint8Array([
          0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(spectrumInterval); addon.kbdSetModeSpectrum(); },
  },
  {
    label: 'Reactive',
    submenu: [
      {
        label: 'Custom color',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeReactive(new Uint8Array([
          3, customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeReactive(new Uint8Array([
          3,0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeReactive(new Uint8Array([
          3,0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeReactive(new Uint8Array([
          3,0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Breathe',
    click() { clearInterval(spectrumInterval); addon.kbdSetModeBreathe(new Uint8Array([
      0 // random
    ]))}
  },
  {
    label: 'Starlight',
    submenu: [
      {
        label: 'Custom color',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStarlight(new Uint8Array([
          3, customKdbColor.rgb.r, customKdbColor.rgb.g, customKdbColor.rgb.b
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStarlight(new Uint8Array([
          3,0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStarlight(new Uint8Array([
          3,0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(spectrumInterval); addon.kbdSetModeStarlight(new Uint8Array([
          3,0,0,0xff
        ]))},
      }
    ]
  },
  {
    label: 'Set custom color',
    click() { 
      window.webContents.send('device-selected', {device: 'Keyboard', currentColor: customKdbColor});
      window.show()
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
    click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(spectrumInterval); 
          addon.mouseSetLogoModeStatic(new Uint8Array([
          customMouseColor.rgb.r, customMouseColor.rgb.g, customMouseColor.rgb.b
        ]))},
      },
      {
        label: 'White',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeStatic(new Uint8Array([
          0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() { clearInterval(spectrumInterval); addon.mouseSetLogoModeBreathe(new Uint8Array([
      0 // random
    ]))}
  },
  {
    label: 'Older model effects',
    submenu: [
      {
        label: 'Static',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoLEDEffect('static'); },
      },
      {
        label: 'Blinking',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoLEDEffect('blinking'); },
      },
      {
        label: 'Pulsate',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoLEDEffect('pulsate'); },
      },
      {
        label: 'Scroll',
        click() { clearInterval(spectrumInterval); addon.mouseSetLogoLEDEffect('scroll'); },
      }
    ]
  },
  {
    label: 'Set custom color',
    click() { window.webContents.send('device-selected', {device: 'Mouse', currentColor: customMouseColor}); window.show() }
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
    click() { clearInterval(spectrumInterval); addon.mouseMatSetModeNone(); }
  },
  {
    label: 'Static',
    submenu: [
      {
        label: 'Custom color',
        click() {
          clearInterval(spectrumInterval);
          addon.mouseMatSetModeStatic(new Uint8Array([
          customMouseMatColor.rgb.r, customMouseMatColor.rgb.g, customMouseMatColor.rgb.b
        ]))},
      },
      {
        label: 'White',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeStatic(new Uint8Array([
          0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { clearInterval(spectrumInterval); addon.mouseMatSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { clearInterval(spectrumInterval); addon.mouseMatSetModeSpectrum(); },
  },
  {
    label: 'Breathe',
    click() { clearInterval(spectrumInterval); addon.mouseMatSetModeBreathe(new Uint8Array([
      0 // random
    ]))}
  },
  {
    label: 'Set custom color',
    click() { window.webContents.send('device-selected', {device: 'Mouse Mat', currentColor: customMouseMatColor}); window.show() }
  },
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
let mouseMatDeviceName = '';

const refreshDevices = () => {
  // close devices
  addon.closeKeyboardDevice()
  addon.closeMouseDevice()
  addon.closeMouseMatDevice()

  // get devices
  keyboardDeviceName = addon.getKeyboardDevice();
  mouseDeviceName = addon.getMouseDevice();
  mouseMatDeviceName = addon.getMouseMatDevice();
}

app.on('ready', () => {
  refreshDevices()
  createTray()
  createWindow()
})



app.on('quit', () => {
  addon.closeKeyboardDevice()
  addon.closeMouseDevice()
  addon.closeMouseMatDevice()
})

nativeTheme.on('updated', () => {
 createTray()
})

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { device, color } = arg
  switch (device) {
    case "Mouse":
      customMouseColor = color
      break
    case "Mouse Mat":
      customMouseMatColor = color
      break
    default:
      customKdbColor = color
  }
});


function createWindow() {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 275,
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
    if (app.dock) app.dock.hide()

    if (tray != null) {
      tray.destroy()
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
  // generate menu based on found devices
  let menu = mainMenu;
  if (keyboardDeviceName) {
    keyboardMenu[1].label = keyboardDeviceName;
    menu = menu.concat(keyboardMenu);
  }
  if (mouseDeviceName) {
    mouseMenu[1].label = mouseDeviceName;
    menu = menu.concat(mouseMenu);
  }
  if (mouseMatDeviceName) {
    mouseMatMenu[1].label = mouseMatDeviceName;
    menu = menu.concat(mouseMatMenu);
  }
  menu = menu.concat(mainMenuBottom);

  const contextMenu = Menu.buildFromTemplate(menu);
  tray.setToolTip('Razer macOS menu');
  tray.setContextMenu(contextMenu);
}