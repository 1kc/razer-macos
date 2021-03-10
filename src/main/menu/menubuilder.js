import { getDeviceMenuFor } from './menubuilderdevice';

export function getMenuFor(application) {
  const fullMenu = getMainMenu(application)
    .concat(getCustomColorsCycleMenu(application))
    .concat(getDeviceMenu(application))
    .concat(getMainMenuBottom(application));

  patch(fullMenu, application);
  return fullMenu;
}

function patch(deviceMenu, application) {
  deviceMenu.forEach(menuItem => {
    if (menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        application.razerApplication.stopAnimations();
        originalClick(ev);
      };
    } else if (menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu'], application);
    }
  });
}

function getMainMenu(application) {
  return [
    {
      label: 'Refresh Device List',
      click() {
        application.refreshTray(true);
      },
    },
    {
      label: 'Clear all settings',
      click() {
        application.showConfirm("Really clear all settings?").then(result => {
          if(result.response === 0) {
            return application.razerApplication.settingsManager.clearAll();
          } else {
            return Promise.resolve();
          }
        }).then(() => {
          application.refreshTray(true);
        }).catch(() => {});
      }
    },
    { type: 'separator' },
    {
      label: 'All Devices',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'None',
      click() {
        application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
          device.setModeNone();
        });
      },
    },
    {
      label: 'Static',
      submenu: [
        {
          label: 'Custom',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array(Object.values(device.settings.customColor1.rgb).slice(0,3)));
            });
          },
        },
        {
          label: 'Red',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0xff, 0, 0]));
            });
          },
        },
        {
          label: 'Green',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0xff, 0]));
            });
          },
        },
        {
          label: 'Blue',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(new Uint8Array([0, 0, 0xff]));
            });
          },
        },
      ],
    },
    {
      label: 'Spectrum',
      submenu: [
        {
          label: 'By device',
          toolTip: 'Runs spectrum mode for all attached devices',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setSpectrum();
            });
          }
        },
        {
          label: 'By animation',
          toolTip: 'Starts timed animation which changes color for all attached devices',
          click() {
            application.razerApplication.spectrumAnimation.start();
          }
        },
      ]
    },
  ];
}

function getCustomColorsCycleMenu(application) {
  const cccMenu = [
    {
      label: 'Start Cycle',
      click() {
        application.razerApplication.cycleAnimation.start();
      },
    },
    {
      label: 'Stop Cycle',
      click() {
        application.razerApplication.cycleAnimation.stop();
      },
    },
    { type: 'separator' },
    {
      label: 'Add Color',
      click() {
        application.razerApplication.cycleAnimation.addColor({ r: 0x00, g: 0xff, b: 0x00 });
        application.refreshTray();
      },
    },
    {
      label: 'Reset Colors',
      click() {
        application.razerApplication.cycleAnimation.setColor([
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ]);
        application.refreshTray();
      },
    },
    { type: 'separator' },
  ];

  const colorItems = application.razerApplication.cycleAnimation.getAllColors().map((color, index) => {
    return {
      label: 'Color ' + (index + 1),
      click: () => {
        application.showView({
          mode: 'color',
          index: index,
          color: color
        });
      },
    };
  });

  return [{
    label: 'Cycle',
    submenu: cccMenu.concat(colorItems)
  }]
}

function getDeviceMenu(application) {
  return application.razerApplication.deviceManager.activeRazerDevices.map(device => getDeviceMenuFor(application, device)).flat();
}

function getMainMenuBottom(application) {
  return [
    { type: 'separator' },
    {
      label: 'About',
      submenu: [
        {
          label: `Version: ${application.APP_VERSION}`,
          enabled: false,
        },
      ],
    },
    {
      label: 'Quit',
      click() {
        application.quit();
      },
    },
  ]
}