import { FeatureIdentifier } from '../feature/featureidentifier';
import { RazerDeviceType } from '../device/razerdevicetype';

export function getDeviceMenuFor(application, razerDevice) {
  let deviceMenu = [
    { type: 'separator' },
    getHeaderFor(application, razerDevice),
    { type: 'separator' },
  ];

  const featureMenu = razerDevice.features.map(feature => getFeatureMenuFor(application, razerDevice, feature)).filter(item => item != null);
  deviceMenu = deviceMenu.concat(featureMenu);
  return deviceMenu;
}

function getHeaderFor(application, razerDevice) {

  let label = razerDevice.name;
  let icon = null;
  switch (razerDevice.mainType) {
    case RazerDeviceType.KEYBOARD:
      break;
    case RazerDeviceType.MOUSE:
      if (razerDevice.hasFeature(FeatureIdentifier.BATTERY) && razerDevice.batteryLevel !== -1) {
        if (razerDevice.chargingStatus) {
          label = label + ' - ⚡' + razerDevice.batteryLevel.toString() + '%';
        } else {
          label = label + ' - 🔋' + razerDevice.batteryLevel.toString() + '%';
        }
      }
      break;
    case RazerDeviceType.MOUSEDOCK:
      break;
    case RazerDeviceType.MOUSEMAT:
      break;
    case RazerDeviceType.EGPU:
      break;
    case RazerDeviceType.HEADPHONE:
      break;
    case RazerDeviceType.ACCESSORY:
      break;
  }

  return {
    label: label,
    icon: icon,
    click() {
      application.showView({
        mode: 'device',
        device: razerDevice.serialize(),
      });
    },
  };
}

function getFeatureMenuFor(application, device, feature) {
  switch (feature.featureIdentifier) {
    case FeatureIdentifier.NONE:
      return getFeatureNone(application, device, feature);
    case FeatureIdentifier.STATIC:
      return getFeatureStatic(application, device, feature);
    case FeatureIdentifier.WAVE_SIMPLE:
      return getFeatureWaveSimple(application, device, feature);
    case FeatureIdentifier.WAVE_EXTENDED:
      return getFeatureWaveExtended(application, device, feature);
    case FeatureIdentifier.SPECTRUM:
      return getFeatureSpectrum(application, device, feature);
    case FeatureIdentifier.REACTIVE:
      return getFeatureReactive(application, device, feature);
    case FeatureIdentifier.BREATHE:
      return getFeatureBreath(application, device, feature);
    case FeatureIdentifier.STARLIGHT:
      return getFeatureStarlight(application, device, feature);
    case FeatureIdentifier.BRIGHTNESS:
      return getFeatureBrightness(application, device, feature);
    case FeatureIdentifier.RIPPLE:
      return getFeatureRipple(application, device, feature);
    case FeatureIdentifier.WHEEL:
      return getFeatureWheel(application, device, feature);
    case FeatureIdentifier.OLD_MOUSE_EFFECTS:
      return getFeatureOldMouseEffect(application, device, feature);
    case FeatureIdentifier.MOUSE_BRIGHTNESS:
      return getFeatureMouseBrightness(application, device, feature);
    case FeatureIdentifier.POLL_RATE:
      return null;
    case FeatureIdentifier.MOUSE_DPI:
      return null;
    case FeatureIdentifier.BATTERY:
      return null;
    default:
      throw 'Unmapped feature for identifier ' + feature.featureIdentifier + ' detected.';
  }
}

function getFeatureBreath(application, device, feature) {
  return {
    label: 'Breathe',
    click() {
      // random
      device.setBreathe([0]);
    },
  };
}

function getFeatureBrightness(application, device, feature) {
  const updateBrightness = (brightness) => {
    device.setBrightness(brightness);
    application.refreshTray();
  };

  return {
    label: 'Brightness',
    submenu: [
      {
        label: `Brightness: ${device.getBrightness()}%`,
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
    feature.configuration.enabledStatic ? {
      label: 'Static',
      click() {
        device.setLogoLEDEffect('static');
      },
    } : null,
    feature.configuration.enabledBlinking ? {
      label: 'Blinking',
      click() {
        device.setLogoLEDEffect('blinking');
      },
    } : null,
    feature.configuration.enabledPulsate ? {
      label: 'Pulsate',
      click() {
        device.setLogoLEDEffect('pulsate');
      },
    } : null,
    feature.configuration.enabledScroll ? {
      label: 'Scroll',
      click() {
        device.setLogoLEDEffect('scroll');
      },
    } : null,
  ];

  return {
    label: 'Older model effects',
    submenu: submenu.filter(s => s !== null),
  };
}

function getFeatureReactive(application, device, feature) {
  const singleItem = (label, colorMode) => {
    return {
      label: label,
      click() {
        device.setReactive(colorMode);
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

  if(feature.configuration == null || feature.configuration.rows === -1 ||  feature.configuration.cols === -1) {
    return {
      // device missing rows, cols config
      label: 'Ripple',
      enabled: false
    };
  }

  const singleItem = (label, color, backgroundColor) => {
    return {
      label: label,
      click() {
        device.setRippleEffect(feature.configuration, color, backgroundColor);
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

function getFeatureWheel(application, device, feature) {

  if(feature.configuration == null || feature.configuration.rows === -1 ||  feature.configuration.cols === -1) {
    return {
      // device missing rows, cols config
      label: 'Wheel',
      enabled: false
    };
  }

  const singleItem = (label, speed) => {
    return {
      label: label,
      click() {
        device.setWheelEffect(feature.configuration, speed);
      },
    };
  };

  return {
    label: 'Wheel',
    submenu: [
      singleItem('Slow Speed', 3),
      singleItem('Medium Speed', 2),
      singleItem('Fast Speed', 1),
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
        device.setStarlight([speed].concat(colors));
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
        device.setModeStatic(color);
      },
    };
  };

  const subMenu = [
    singleItem('Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
    feature.hasAllColors() ? singleItem('White', [0xff, 0xff, 0xff]) : null,
    feature.configuration.enabledRed ? singleItem('Red', [0xff, 0, 0]) : null,
    feature.configuration.enabledGreen ? singleItem('Green', [0, 0xff, 0]) : null,
    feature.configuration.enabledBlue ? singleItem('Blue', [0, 0, 0xff]) : null,
  ];

  return {
    label: 'Static',
    submenu: subMenu.filter(s => s !== null),
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

function getFeatureMouseBrightness(application, device, feature) {

  const submenu = [
    feature.configuration.enabledMatrix ? {
      label: 'All (' + device.getBrightnessMatrix() + '%)',
      submenu: [
        {
          label: '0%', click() {
            device.setBrightnessMatrix(0);
            application.refreshTray();
          },
        },
        {
          label: '100%', click() {
            device.setBrightnessMatrix(100);
            application.refreshTray();
          },
        },
      ],
    } : null,
    feature.configuration.enabledLogo ? {
      label: 'Logo (' + device.getBrightnessLogo() + '%)',
      submenu: [
        {
          label: '0%', click() {
            device.setBrightnessLogo(0);
            application.refreshTray();
          },
        },
        {
          label: '100%', click() {
            device.setBrightnessLogo(100);
            application.refreshTray();
          },
        },
      ],
    } : null,
    feature.configuration.enabledScroll ?
      {
        label: 'Scroll (' + device.getBrightnessScroll() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessScroll(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessScroll(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
    feature.configuration.enabledLeft ?
      {
        label: 'Left (' + device.getBrightnessLeft() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessLeft(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessLeft(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
    feature.configuration.enabledRight ?
      {
        label: 'Right (' + device.getBrightnessRight() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessRight(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessRight(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
  ];

  return {
    label: 'Brightness',
    submenu: submenu.filter(s => s!= null),
  };
}
