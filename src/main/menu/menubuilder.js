import { getDeviceMenuFor } from './menubuilderdevice';

export function getMenuFor(razerApplication) {
  const fullMenu = getMainMenu(razerApplication)
    .concat(getCustomColorsCycleMenu(razerApplication))
    .concat(getDeviceMenu(razerApplication))
    .concat(getMainMenuBottom(razerApplication));

  patch(fullMenu, razerApplication);
  return fullMenu;
}

function patch(deviceMenu, razerApplication) {
  deviceMenu.forEach(menuItem => {
    if (menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        razerApplication.spectrumAnimation.stop();
        razerApplication.cycleAnimation.stop();
        originalClick(ev);
      };
    } else if (menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu'], razerApplication);
    }
  });
}

function getMainMenu(razerApplication) {
  return [
    {
      label: 'Refresh Device List',
      click() {
        razerApplication.refreshTray(true);
      },
    },
    {
      label: 'Clear all settings',
      click() {
        razerApplication.showConfirm("Really clear all settings?").then(result => {
          if(result.response === 0) {
            return razerApplication.settingsManager.clearAll();
          } else {
            return Promise.resolve();
          }
        }).then(() => {
          razerApplication.refreshTray(true);
        }).catch(() => {});
      }
    },
    { type: 'separator' },
    {
      label: 'None All Devices',
      click() {
        razerApplication.deviceManager.activeRazerDevices.forEach(device => {
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
            razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array(Object.values(device.settings.customColor1.rgb).slice(0,3)));
            });
          },
        },
        {
          label: 'Red',
          click() {
            razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0xff, 0, 0]));
            });
          },
        },
        {
          label: 'Green',
          click() {
            razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0xff, 0]));
            });
          },
        },
        {
          label: 'Blue',
          click() {
            razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0, 0xff]));
            });
          },
        },
      ],
    },
    {
      label: 'Spectrum All Devices',
      click() {
        razerApplication.deviceManager.activeRazerDevices.forEach(device => {
          device.setSpectrum();
        });
      },
    }
  ];
}

function getCustomColorsCycleMenu(razerApplication) {
  const cccMenu = [
    {
      label: 'Cycle All Devices',
      click() {
        razerApplication.cycleAnimation.start();
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        razerApplication.cycleAnimation.addColor({ r: 0x00, g: 0xff, b: 0x00 });
        razerApplication.refreshTray();
      },
    },
    {
      label: 'Reset Colors',
      click() {
        razerApplication.cycleAnimation.setColor([
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ]);
        razerApplication.refreshTray();
      },
    },
    { type: 'separator' },
  ];

  const colorItems = razerApplication.cycleAnimation.getAllColors().map((color, index) => {
    return {
      label: 'Color ' + (index + 1),
      click: () => {
        razerApplication.showView({
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

function getDeviceMenu(razerApplication) {
  return razerApplication.deviceManager.activeRazerDevices.map(device => getDeviceMenuFor(razerApplication, device)).flat();
}

function getMainMenuBottom(razerApplication) {
  return [
    { type: 'separator' },
    {
      label: 'About',
      submenu: [
        {
          label: `Version: ${razerApplication.APP_VERSION}`,
          enabled: false,
        },
      ],
    },
    {
      label: 'Quit',
      click() {
        razerApplication.quit();
      },
    },
  ]
}