'use strict'

import { app, Menu, Tray, nativeTheme } from 'electron'
import addon from '../driver'
import * as path from 'path'

//const isDevelopment = process.env.NODE_ENV !== 'production'


let tray = null

app.on('ready', () => {
  createTray();
})

app.on('quit', () => {
  addon.closeDevice();  
})

nativeTheme.on('updated', () => {
 createTray();
})

function createTray() {
  if (app.dock) app.dock.hide()

  if(tray != null) {
    tray.destroy();
  } 

  if(nativeTheme.shouldUseDarkColors) {
    tray = new Tray(path.join(__dirname, '../assets/icon-darkmode.png'))  
  } else {
    tray = new Tray(path.join(__dirname, '../assets/icon-lightmode.png'))   
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: addon.getDevice(),
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'None',
      click() { addon.setModeNone(); },
    },
    {
      label: 'Static',
      submenu: [
        {
          label: 'White',
          click() { addon.setModeStatic(); }
        },
      ]
    },
    {
      label: 'Wave',
      submenu: [
        {
          label: 'Left',
          click() { addon.setModeWave(); }
        },
        {
          label: 'Right',
          click() { addon.setModeWave(); }
        },
      ]
    },
    {
      label: 'Spectrum',
      click() { addon.setModeSpectrum(); },
    },
    {
      label: 'Reactive',
      click() {},
    },
    {
      label: 'Breathe',
      click() {},
    },
    {
      label: 'Starlight',
      click() {},
    },
    {
      label: 'Ripple',
      click() {},
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