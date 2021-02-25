export function getMenuItemNone(device) {
  return {
    label: 'None',
    click() {
      device.setModeNone();
    },
  };
}

export function getMenuItemStatic(device) {

  const singleItem = (label, color) => {
    return {
      label: label,
      click() {
        device.setModeStatic(new Uint8Array(color));
      },
    };
  };

  return {
    label: 'Static',
    submenu: [
      singleItem('Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      singleItem('White', [0xff, 0xff, 0xff]),
      singleItem('Red', [0xff, 0, 0]),
      singleItem('Green', [0, 0xff, 0]),
      singleItem('Blue', [0, 0, 0xff]),
    ],
  };
}

export function getMenuItemSpectrum(device) {
  return {
    label: 'Spectrum',
    click() {
      device.setSpectrum();
    },
  };
}

export function getMenuItemBreathe(device) {
  return {
    label: 'Breathe',
    click() {
      // random
      device.setBreathe(new Uint8Array([0]));
    },
  };
}

export function getMenuItemSetCustomColor(device, label) {
  return {
    label: label,
    click() {
      window.webContents.send('device-selected', {
        device: device,
      });
      window.setSize(500, 300);
      window.show();
    },
  };
}


/*
*
* Not all devices have these features, be careful
*
*/

export function getMenuItemWaveSimple(device) {
  return {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        click() {
          device.setWaveSimple('left');
        },
      },
      {
        label: 'Right',
        click() {
          device.setWaveSimple('right');
        },
      },
    ],
  };
}

export function getMenuItemWaveExtended(device) {

  const singleItem = (label, directionSpeed) => {
    return {
      label: label,
      click() {
        device.setWaveExtended(directionSpeed);
      },
    };
  };

  const menuFor = (direction) => {
    return [
      singleItem('Turtle Speed', direction + '_turtle'),
      singleItem('Slowest Speed', direction + '_slowest'),
      singleItem('Slower Speed', direction + '_slower'),
      singleItem('Slow Speed', direction + '_slow'),
      singleItem('Normal Speed', direction + '_default'),
      singleItem('Fast Speed', direction + '_fast'),
      singleItem('Faster Speed', direction + '_faster'),
      singleItem('Fastest Speed', direction + '_fastest'),
      singleItem('Lightning Speed', direction + '_lightning'),
    ];
  };

  return {
    label: 'Wave',
    submenu: [
      {
        label: 'Left',
        submenu: menuFor('left'),
      },
      {
        label: 'Right',
        submenu: menuFor('right'),
      },
    ],
  };
}

export function getMenuItemReactive(device) {
  const singleItem = (label, colorMode) => {
    return {
      label: label,
      click() {
        device.setReactive(new Uint8Array(colorMode));
      },
    };
  };
  return {
    label: 'Reactive',
    submenu: [
      singleItem('Custom color', [3, device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      singleItem('Red', [3, 0xff, 0, 0]),
      singleItem('Green', [3, 0, 0xff, 0]),
      singleItem('Blue', [3, 0, 0, 0xff]),
    ],
  };
}

export function getMenuItemStarlight(device) {

  const singleItem = (label, speed, colors) => {
    return {
      label: label,
      click() {
        device.setStarlight(new Uint8Array([speed].concat(colors)));
      },
    };
  };

  const menuFor = (colors) => {
    return [
      singleItem('Slow Speed', 3, colors),
      singleItem('Medium Speed', 2, colors),
      singleItem('Fast Speed', 1, colors),
    ];
  };

  return {
    label: 'Starlight',
    submenu: [
      {
        label: 'Custom color',
        submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      },
      {
        label: 'Custom dual color',
        submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b, device.settings.customColor2.rgb.r, device.settings.customColor2.rgb.g, device.settings.customColor2.rgb.b]),
      },
      {
        label: 'Random',
        submenu: menuFor([]),
      },
      {
        label: 'Red',
        submenu: menuFor([0xff, 0, 0]),
      },
      {
        label: 'Green',
        submenu: menuFor([0, 0xff, 0]),
      },
      {
        label: 'Blue',
        submenu: menuFor([0, 0, 0xff]),
      },
      {
        label: 'Purple',
        submenu: menuFor([0x80, 0, 0x80]),
      },
      {
        label: 'Aqua',
        submenu: menuFor([0, 0xff, 0xff]),
      },
      {
        label: 'Orange',
        submenu: menuFor([0xff, 0x45, 0]),
      },

      {
        label: 'Red and Green',
        submenu: menuFor([0xff, 0, 0, 0, 0xff, 0]),
      },
      {
        label: 'Red and Blue',
        submenu: menuFor([0xff, 0, 0, 0, 0, 0xff]),
      },
      {
        label: 'Blue and Green',
        submenu: menuFor([0, 0, 0xff, 0, 0xff, 0]),
      },
    ],
  };
}

export function getMenuItemOldMouseEffects(device) {
  return {
    label: 'Older model effects',
    submenu: [
      {
        label: 'Static',
        click() {
          device.setLogoLEDEffect('static');
        },
      },
      {
        label: 'Blinking',
        click() {
          device.setLogoLEDEffect('blinking');
        },
      },
      {
        label: 'Pulsate',
        click() {
          device.setLogoLEDEffect('pulsate');
        },
      },
      {
        label: 'Scroll',
        click() {
          device.setLogoLEDEffect('scroll');
        },
      },
    ],
  };
}

export function getMenuItemBrightness(device, razerApp) {
  return {
    label: 'Brightness',
    submenu: [
      {
        label: `Brightness: ${device.brightness}%`,
      },
      { type: 'separator' },
      {
        label: 'Set to 0%',
        click() {
          device.setBrightness(0);
          razerApp.refreshTray();
        },
      },
      {
        label: 'Set to 100%',
        click() {
          device.setBrightness(100);
          razerApp.refreshTray();
        },
      },
    ],
  };
}