'use strict'

import { app, Menu, Tray, nativeTheme } from 'electron'
import addon from '../driver'
import * as path from 'path'

//const isDevelopment = process.env.NODE_ENV !== 'production'

let tray = null

app.on('ready', () => {
  createTray()
})

app.on('quit', () => {
  addon.closeDevice()
})

nativeTheme.on('updated', () => {
 createTray()
})

function createTray() {
  if (app.dock) app.dock.hide()

  if (tray != null) {
    tray.destroy()
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
        1,0,0xff,0,0,0xff,0 // green
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