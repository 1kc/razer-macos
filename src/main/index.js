'use strict'

import { app, Menu, Tray } from 'electron'
import addon from '../driver'
import * as path from 'path'

//const isDevelopment = process.env.NODE_ENV !== 'production'


let tray = null


app.on('ready', () => {
  if (app.dock) app.dock.hide()

  tray = new Tray(path.join(__dirname, '../assets/icon.png'))
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
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})

app.on('quit', () => {
  addon.closeDevice();
})