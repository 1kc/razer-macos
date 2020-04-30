'use strict'

import { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import addon from '../driver'
import path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

let tray = null
let window = null
let forceQuit = false;

app.on('ready', () => {
  createTray()
  createWindow()
})



app.on('quit', () => {
  addon.closeDevice()
})

nativeTheme.on('updated', () => {
 createTray()
})

// custom color rpc listener
ipcMain.on('request-set-custom-color', (event, arg) => {
  const { mode, color } = arg
  const colorArr = new Uint8Array([color.rgb.r, color.rgb.g, color.rgb.b]);
  // TODO: implement speed
  const speedColorArr = new Uint8Array([1, color.rgb.r, color.rgb.g, color.rgb.b]);

  switch (mode) {
    case "static":
      addon.setModeStatic(colorArr)
      break
    case "reactive":
      addon.setModeReactive(speedColorArr)
      break
    case "starlight":
      addon.setModeStarlight(speedColorArr)
      break
    default:
      addon.setModeStatic(colorArr)
  }
});


function createWindow() {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    titleBarStyle: 'hidden',
    height: 150,
    resizable: false,
    width: 316,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#242424",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
  })
  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
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

  const contextMenu = Menu.buildFromTemplate([
    {
      // Initialise and get device name
      label: addon.getDevice() || 'No device found',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Custom color',
      click() { window.show() }
    },
    { type: 'separator' },
    {
      label: 'None',
      click() { addon.setModeNone(); },
    },
    {
      label: 'Static',
      submenu: [
        { // TODO: implement a better way to deal with colours
          label: 'White',
          click() { addon.setModeStatic(new Uint8Array([
            0xff,0xff,0xff
          ]))},
        },
        {
          label: 'Red',
          click() {addon.setModeStatic(new Uint8Array([
            0xff,0,0
          ]))},
        },
        {
          label: 'Green',
          click() {addon.setModeStatic(new Uint8Array([
            0,0xff,0
          ]))},
        },
        {
          label: 'Blue',
          click() {addon.setModeStatic(new Uint8Array([
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
          click() { addon.setModeWave("left"); }
        },
        {
          label: 'Right',
          click() { addon.setModeWave("right"); }
        },
      ]
    },
    {
      label: 'Spectrum',
      click() { addon.setModeSpectrum(); },
    },
    {
      label: 'Reactive',
      submenu: [
        {
          label: 'Red',
          click() {addon.setModeReactive(new Uint8Array([
            1,0xff,0,0
          ]))},
        },
        {
          label: 'Green',
          click() {addon.setModeReactive(new Uint8Array([
            1,0,0xff,0
          ]))},
        },
        {
          label: 'Blue',
          click() {addon.setModeReactive(new Uint8Array([
            1,0,0,0xff
          ]))},
        },
      ]
    },
    {
      label: 'Breathe',
      click() {addon.setModeBreathe(new Uint8Array([
        0 // random
      ]))}
    },
    {
      label: 'Starlight',
      click() {addon.setModeStarlight(new Uint8Array([
        1,0,0xff,0,0 // green
      ]))},
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click() { app.quit(); }
    }
  ])
  tray.setToolTip('Razer macOS menu')
  tray.setContextMenu(contextMenu)

}
