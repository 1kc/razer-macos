export function getMenuFor(razerApp) {
  const fullMenu = getMainMenu(razerApp)
    .concat(getCustomColorsCycleMenu(razerApp))
    .concat(getDeviceMenu(razerApp))
    .concat(getMainMenuBottom(razerApp));

  patch(fullMenu, razerApp);
  return fullMenu;
}

function patch(deviceMenu, razerApp) {
  deviceMenu.forEach(menuItem => {
    if (menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        razerApp.spectrumAnimation.stop();
        razerApp.cycleAnimation.stop();
        originalClick(ev);
      };
    } else if (menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu'], razerApp);
    }
  });
}

function getMainMenu(razerApp) {
  return [
    {
      label: 'Refresh Device List',
      click() {
        razerApp.refreshTray(true);
      },
    },
    {
      label: 'Clear all settings',
      click() {
        razerApp.app.focus();
        razerApp.dialog.showMessageBox({
          buttons: ["Yes","No"], message: "Really clear all settings?"
        }).then(result => {
          if(result.response === 0) {
            return razerApp.settingsManager.clearAll();
          } else {
            return Promise.resolve();
          }
        }).then(() => {
          razerApp.refreshTray(true);
        }).catch(() => {});
      }
    },
    { type: 'separator' },
    {
      label: 'None All Devices',
      click() {
        razerApp.deviceManager.activeRazerDevices.forEach(device => {
          device.setModeNone();
        });
      },
    },
    {
      label: 'Color All Devices',
      submenu: [
        {
          label: 'Custom',
          click() {
            razerApp.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array(Object.values(device.settings.customColor1.rgb).slice(0,3)));
            });
          },
        },
        {
          label: 'Red',
          click() {
            razerApp.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0xff, 0, 0]));
            });
          },
        },
        {
          label: 'Green',
          click() {
            razerApp.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0xff, 0]));
            });
          },
        },
        {
          label: 'Blue',
          click() {
            razerApp.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0, 0xff]));
            });
          },
        },
      ],
    },
    {
      label: 'Spectrum All Devices',
      click() {
        razerApp.deviceManager.activeRazerDevices.forEach(device => {
          device.setSpectrum();
        });
      },
    }
  ];
}

function getCustomColorsCycleMenu(razerApp) {
  const cccMenu = [
    {
      label: 'Cycle All Devices',
      click() {
        razerApp.cycleAnimation.start();
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        razerApp.cycleAnimation.addColor({ r: 0x00, g: 0xff, b: 0x00 });
        razerApp.refreshTray();
      },
    },
    {
      label: 'Reset Colors',
      click() {
        razerApp.cycleAnimation.setColor([
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ]);
        razerApp.refreshTray();
      },
    },
    { type: 'separator' },
  ];

  const colorItems = razerApp.cycleAnimation.getAllColors().map((color, index) => {
    return {
      label: 'Color ' + (index + 1),
      click: () => {
        razerApp.window.webContents.send('render-view', {
          mode: 'color',
          index: index,
          color: color
        });
      },
    };
  });

  return [{
    label: 'Cycle All Devices',
    submenu: cccMenu.concat(colorItems)
  }]
}

function getDeviceMenu(razerApp) {
  return razerApp.deviceManager.activeRazerDevices.map(device => device.getMenuItem(razerApp)).flat();
}

function getMainMenuBottom(razerApp) {
  return [
    { type: 'separator' },
    {
      label: 'About',
      submenu: [
        {
          label: `Version: ${razerApp.APP_VERSION}`,
          enabled: false,
        },
      ],
    },
    {
      label: 'Quit',
      click() {
        razerApp.app.quit();
      },
    },
  ]
}