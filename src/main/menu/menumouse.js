import addon from '../../driver';

export function getmouseSetLogoModeStatic(device, label, color) {
  return {
    label: label,
    click() {
      addon.mouseSetLogoModeStatic(device.internalId, new Uint8Array(color));
    },
  };
}

export function getmouseSetLogoModeReactive(device, label, color) {
  // Speed currently defaults to 3 until we add speed controls
  const modeColor = [3].concat(color);
  return {
    label: label,
    click() {
      addon.mouseSetLogoModeReactive(device.internalId, new Uint8Array(modeColor));
    },
  };
}

export function getMouseMenuFor(device) {
  return [
    { type: 'separator' },
    {
      label: device.getName(),
    },
    { type: 'separator' },
    {
      label: 'None',
      click() {
        addon.mouseSetLogoModeNone(device.internalId);
      },
    },
    {
      label: 'Static',
      submenu: [
        getmouseSetLogoModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
        getmouseSetLogoModeStatic(device, 'White', [0xff, 0xff, 0xff]),
        getmouseSetLogoModeStatic(device, 'Red', [0xff, 0, 0]),
        getmouseSetLogoModeStatic(device, 'Green', [0, 0xff, 0]),
        getmouseSetLogoModeStatic(device, 'Blue', [0, 0, 0xff]),
      ],
    },
    {
      label: 'Wave',
      submenu: [
        {
          label: 'Left',
          click() {
            addon.mouseSetLogoModeWave(device.internalId, 'left');
          },
        },
        {
          label: 'Right',
          click() {
            addon.mouseSetLogoModeWave(device.internalId, 'right');
          },
        },
      ],
    },
    {
      label: 'Spectrum',
      click() {
        addon.mouseSetLogoModeSpectrum(device.internalId);
      },
    },
    {
      label: 'Reactive', // Speed currently defaults to 3 until we add speed controls
      submenu: [
        getmouseSetLogoModeReactive(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
        getmouseSetLogoModeReactive(device, 'White', [0xff, 0xff, 0xff]),
        getmouseSetLogoModeReactive(device, 'Red', [0xff, 0, 0]),
        getmouseSetLogoModeReactive(device, 'Green', [0, 0xff, 0]),
        getmouseSetLogoModeReactive(device, 'Blue', [0, 0, 0xff]),
      ],
    },
    {
      label: 'Breathe',
      click() {
        addon.mouseSetLogoModeBreathe(
          device.internalId,
          new Uint8Array([
            0, // random
          ]),
        );
      },
    },
    {
      label: 'Older model effects',
      submenu: [
        {
          label: 'Static',
          click() {
            addon.mouseSetLogoLEDEffect(device.internalId, 'static');
          },
        },
        {
          label: 'Blinking',
          click() {
            addon.mouseSetLogoLEDEffect(device.internalId, 'blinking');
          },
        },
        {
          label: 'Pulsate',
          click() {
            addon.mouseSetLogoLEDEffect(device.internalId, 'pulsate');
          },
        },
        {
          label: 'Scroll',
          click() {
            addon.mouseSetLogoLEDEffect(device.internalId, 'scroll');
          },
        },
      ],
    },
    {
      label: 'Mouse custom settings',
      click() {
        window.webContents.send('device-selected', {
          device: device,
        });
        window.setSize(500, 480);
        window.show();
      },
    },
  ];
}