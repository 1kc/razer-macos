'use strict'

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import addon from '../driver'
import path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV == 'development'

let tray = null
let window = null
let forceQuit = false;
const template = [
  {
    label: 'Refresh',
    click() {refreshDevices()},
  },
  { type: 'separator' },
  {
    // Initialise and get keyboard device name
    label: addon.getKeyboardDevice() || 'No keyboard found',
    enabled: false,
  },
  { type: 'separator' },
  {
    label: 'Custom color',
    click() { window.show() }
  },
  {
    label: 'None',
    click() { addon.kbdSetModeNone(); },
  },
  {
    label: 'Static',
    submenu: [
      { // TODO: implement a better way to deal with colours
        label: 'White',
        click() { addon.kbdSetModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() {addon.kbdSetModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() {addon.kbdSetModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() {addon.kbdSetModeStatic(new Uint8Array([
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
        click() { addon.kbdSetModeWave('left'); }
      },
      {
        label: 'Right',
        click() { addon.kbdSetModeWave('right'); }
      },
    ]
  },
  {
    label: 'Spectrum',
    click() { addon.kbdSetModeSpectrum(); },
  },
  {
    label: 'Reactive',
    submenu: [
      {
        label: 'Red',
        click() {addon.kbdSetModeReactive(new Uint8Array([
          3,0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() {addon.kbdSetModeReactive(new Uint8Array([
          3,0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() {addon.kbdSetModeReactive(new Uint8Array([
          3,0,0,0xff
        ]))},
      },
    ]
  },
  {
    label: 'Breathe',
    click() {addon.kbdSetModeBreathe(new Uint8Array([
      0 // random
    ]))}
  },
  {
    label: 'Starlight',
    submenu: [
      {
        label: 'Red',
        click() {addon.kbdSetModeStarlight(new Uint8Array([
          3,0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() {addon.kbdSetModeStarlight(new Uint8Array([
          3,0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() {addon.kbdSetModeStarlight(new Uint8Array([
          3,0,0,0xff
        ]))},
      },
      
    ]
  },
  { type: 'separator' },
  {
    // Initialise and get mouse device name
    label: addon.getMouseDevice() || 'No mouse found',
    enabled: false,
  },
  { type: 'separator' },
  // {
  //   label: 'Static',
  //   click() { addon.mouseSetLogoLEDEffect('static'); },
  // },
  // {
  //   label: 'Blinking',
  //   click() { addon.mouseSetLogoLEDEffect('blinking'); },
  // },
  // {
  //   label: 'Pulsate',
  //   click() { addon.mouseSetLogoLEDEffect('pulsate'); },
  // },
  // {
  //   label: 'Scroll',
  //   click() { addon.mouseSetLogoLEDEffect('scroll'); },
  // },
  {
    label: 'Logo None',
    click() { addon.mouseSetLogoModeNone(); }
  },
  {
    label: 'Logo Static',
    submenu: [
      {
        label: 'White',
        click() { addon.mouseSetLogoModeStatic(new Uint8Array([
          0xff,0xff,0xff
        ]))},
      },
      {
        label: 'Red',
        click() {addon.mouseSetLogoModeStatic(new Uint8Array([
          0xff,0,0
        ]))},
      },
      {
        label: 'Green',
        click() {addon.mouseSetLogoModeStatic(new Uint8Array([
          0,0xff,0
        ]))},
      },
      {
        label: 'Blue',
        click() {addon.mouseSetLogoModeStatic(new Uint8Array([
          0,0,0xff
        ]))},
      },
    ]
  },
  { type: 'separator' },
  {
    label: 'Quit',
    click() { app.quit(); }
  },
  
]

const refreshDevices = () => {
  addon.closeKeyboardDevice()
  addon.closeMouseDevice()
  // TODO: change template indexing
  template[2].label = addon.getKeyboardDevice() || 'No keyboard found';
  template[13].label = addon.getMouseDevice() || 'No mouse found';
  // Rebuild menu
  const newContextMenu = Menu.buildFromTemplate(template)
  tray.setContextMenu(newContextMenu)
}

app.on('ready', () => {
  createTray()
  createWindow()
})



app.on('quit', () => {
  addon.closeKeyboardDevice()
  addon.closeMouseDevice()
})

nativeTheme.on('updated', () => {
 createTray()
})

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { mode, color } = arg
  const colorArr = new Uint8Array([color.rgb.r, color.rgb.g, color.rgb.b]);
  // TODO: implement speed
  const speedColorArr = new Uint8Array([3, color.rgb.r, color.rgb.g, color.rgb.b]);

  switch (mode) {
    case "static":
      addon.kbdSetModeStatic(colorArr)
      break
    case "reactive":
      addon.kbdSetModeReactive(speedColorArr)
      break
    case "starlight":
      addon.kbdSetModeStarlight(speedColorArr)
      break
    default:
      addon.kbdSetModeStatic(colorArr)
  }
});


function createWindow() {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 150,
    resizable: false,
    width: 340,
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

  const contextMenu = Menu.buildFromTemplate(template);
  tray.setToolTip('Razer macOS menu')
  tray.setContextMenu(contextMenu)

}
