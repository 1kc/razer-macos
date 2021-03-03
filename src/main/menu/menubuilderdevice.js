export function getDeviceMenuFor(application, razerDevice) {
  let deviceMenu = [
    { type: 'separator' },
    {
      label: razerDevice.getName(),
      enabled: false,
    },
    { type: 'separator' },
  ];

  const featureMenu = razerDevice.features.map(feature => getFeatureMenuFor(application, razerDevice, feature));
  deviceMenu = deviceMenu.concat(featureMenu);
  deviceMenu = deviceMenu.concat([{
    label: 'Custom settings',
    click() {
      application.showView({
        mode: 'device',
        device: razerDevice.serialize(),
      });
    },
  }]);
  return deviceMenu;
}

function getFeatureMenuFor(application, device, feature) {
  switch (feature.featureIdentifier) {
    case 'none': return getFeatureNone(application, device, feature);
    case 'static': return getFeatureStatic(application, device, feature);
    case 'waveSimple': return getFeatureWaveSimple(application, device, feature);
    case 'waveExtended': return getFeatureWaveExtended(application, device, feature);
    case 'spectrum': return getFeatureSpectrum(application, device, feature);
    case 'reactive': return getFeatureReactive(application, device, feature);
    case 'breathe': return getFeatureBreath(application, device, feature);
    case 'starlight': return getFeatureStarlight(application, device, feature);
    case 'brightness': return getFeatureBrightness(application, device, feature);
    case 'ripple': return getFeatureRipple(application, device, feature);
    case 'oldMouseEffects': return getFeatureOldMouseEffect(application, device, feature);
  }
}

function getFeatureBreath(application, device, feature) {
  return {
    label: 'Breathe',
    click() {
      // random
      device.setBreathe(new Uint8Array([0]));
    },
  };
}

function getFeatureBrightness(application, device, feature) {
  const updateBrightness = (brightness) => {
    device.settings.customBrightness = brightness;
    device.setBrightness(device.settings.customBrightness);
    application.refreshTray();
  };

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
          updateBrightness(0);
        },
      },
      {
        label: 'Set to 100%',
        click() {
          updateBrightness(100);
        },
      },
    ],
  };
}

function getFeatureNone(application, device, feature) {
  return {
    label: 'None',
    click() {
      device.setModeNone();
    },
  };
}

function getFeatureOldMouseEffect(application, device, feature) {

  const submenu = [
    feature.configuration != null && feature.configuration.disabledStatic ? null : {
      label: 'Static',
      click() {
        device.setLogoLEDEffect('static');
      },
    },
    feature.configuration != null && feature.configuration.disabledBlinking ? null :{
      label: 'Blinking',
      click() {
        device.setLogoLEDEffect('blinking');
      },
    },
    feature.configuration != null && feature.configuration.disabledPulsate ? null :{
      label: 'Pulsate',
      click() {
        device.setLogoLEDEffect('pulsate');
      },
    },
    feature.configuration != null && feature.configuration.disabledScroll ? null :{
      label: 'Scroll',
      click() {
        device.setLogoLEDEffect('scroll');
      },
    },
  ];

  return {
    label: 'Older model effects',
    submenu: submenu.filter(s => s !== null)
  };
}

function getFeatureReactive(application, device, feature) {
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

function getFeatureRipple(application, device, feature) {
  const singleItem = (label, color, backgroundColor) => {
    return {
      label: label,
      click() {
        device.setRippleEffect(color, backgroundColor);
      },
    };
  };

  return {
    label: 'Ripple',
    submenu: [
      singleItem('Custom color', Object.values(device.settings.customColor1.rgb).slice(0, 3)),
      singleItem('Custom dual color',
        Object.values(device.settings.customColor1.rgb).slice(0, 3),
        Object.values(device.settings.customColor2.rgb).slice(0, 3),
      ),
      singleItem('Red', [0xff, 0, 0]),
      singleItem('Green', [0, 0xff, 0]),
      singleItem('Blue', [0, 0, 0xff]),
    ],
  };
}

function getFeatureSpectrum(application, device, feature) {
  return {
    label: 'Spectrum',
    click() {
      device.setSpectrum();
    },
  };
}

function getFeatureStarlight(application, device, feature) {
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

function getFeatureStatic(application, device, feature) {
  const singleItem = (label, color) => {
    return {
      label: label,
      click() {
        device.setModeStatic(new Uint8Array(color));
      },
    };
  };

  const subMenu = [
    singleItem('Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
    feature.configuration != null && feature.configuration.disabledWhite ? null : singleItem('White', [0xff, 0xff, 0xff]),
    feature.configuration != null && feature.configuration.disabledRed ? null : singleItem('Red', [0xff, 0, 0]),
    feature.configuration != null && feature.configuration.disabledGreen? null : singleItem('Green', [0, 0xff, 0]),
    feature.configuration != null && feature.configuration.disabledBlue ? null : singleItem('Blue', [0, 0, 0xff]),
  ];

  return {
    label: 'Static',
    submenu: subMenu.filter(s => s !== null),
    checked: device.isModeStaticActive(),
  };
}

function getFeatureWaveExtended(application, device, feature) {
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

function getFeatureWaveSimple(application, device, feature) {
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