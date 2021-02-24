import addon from "../../driver";

export function getkbdSetModeStatic(device, label, colors) {
    return {
        label: label,
        click() {
            addon.kbdSetModeStatic(device.internalId, new Uint8Array(colors));
        }
    }
}

export function getkbdSetModeWaveFor(device, direction) {
    return [
        getkbdSetModeWave(device, 'Turtle Speed', direction+'_turtle'),
        getkbdSetModeWave(device, 'Slowest Speed', direction+'_slowest'),
        getkbdSetModeWave(device, 'Slower Speed', direction+'_slower'),
        getkbdSetModeWave(device, 'Slow Speed', direction+'_slow'),
        getkbdSetModeWave(device, 'Normal Speed', direction+'_default'),
        getkbdSetModeWave(device, 'Fast Speed', direction+'_fast'),
        getkbdSetModeWave(device, 'Faster Speed', direction+'_faster'),
        getkbdSetModeWave(device, 'Fastest Speed', direction+'_fastest'),
        getkbdSetModeWave(device, 'Lightning Speed', direction+'_lightning')
    ]
}

export function getkbdSetModeWave(device, label, speed) {
    return {
        label: label,
        click() {
            addon.kbdSetModeWave(device.internalId, speed);
        }
    };
}

export function getkbdSetModeReactive(device, label, colormode) {
    return {
        label: label,
        click() {
            addon.kbdSetModeReactive(device.internalId, new Uint8Array(colormode));
        },
    };
}

export function getkbdSetModeStarlightAll(device, colors) {
    return [
        getkbdSetModeStarlight(device, 'Slow Speed', 3, colors),
        getkbdSetModeStarlight(device, 'Medium Speed', 2, colors),
        getkbdSetModeStarlight(device, 'Fast Speed', 1, colors)
    ];
}

export function getkbdSetModeStarlight(device, label, speed, colors) {
    return {
        label: label,
        click() {
            addon.kbdSetModeStarlight(device.internalId, new Uint8Array([speed].concat(colors)));
        }
    };
}

export function getKeyboardMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: device.getName(),
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.kbdSetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getkbdSetModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
                getkbdSetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getkbdSetModeStatic(device, 'Red', [0xff, 0, 0]),
                getkbdSetModeStatic(device, 'Green', [0, 0xff, 0]),
                getkbdSetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Wave',
            submenu: [
                {
                    label: 'Left',
                    submenu: getkbdSetModeWaveFor(device, 'left')
                },
                {
                    label: 'Right',
                    submenu: getkbdSetModeWaveFor(device, 'right')
                },
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.kbdSetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Reactive',
            submenu: [
                getkbdSetModeReactive(device, 'Custom color', [3, device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
                getkbdSetModeReactive(device, 'Red', [3, 0xff, 0, 0]),
                getkbdSetModeReactive(device, 'Green', [3, 0, 0xff, 0]),
                getkbdSetModeReactive(device, 'Blue', [3, 0, 0, 0xff]),
            ],
        },
        {
            label: 'Breathe',
            click() {
                addon.kbdSetModeBreathe(
                  device.internalId,
                    new Uint8Array([
                        0, // random
                    ])
                );
            },
        },
        {
            label: 'Starlight',
            submenu: [
                {
                    label: 'Custom color',
                    submenu: getkbdSetModeStarlightAll(device, [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b])
                },
                {
                    label: 'Custom dual color',
                    submenu: getkbdSetModeStarlightAll(device, [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b, device.settings.customColor2.rgb.r, device.settings.customColor2.rgb.g, device.settings.customColor2.rgb.b])
                },
                {
                    label: 'Random',
                    submenu: getkbdSetModeStarlightAll(device, [])
                },
                {
                    label: 'Red',
                    submenu: getkbdSetModeStarlightAll(device, [0xff, 0, 0])
                },
                {
                    label: 'Green',
                    submenu: getkbdSetModeStarlightAll(device, [0, 0xff, 0])
                },
                {
                    label: 'Blue',
                    submenu: getkbdSetModeStarlightAll(device, [0, 0, 0xff])
                },
                {
                    label: 'Purple',
                    submenu: getkbdSetModeStarlightAll(device, [0x80, 0, 0x80])
                },
                {
                    label: 'Aqua',
                    submenu: getkbdSetModeStarlightAll(device, [0, 0xff, 0xff])
                },
                {
                    label: 'Orange',
                    submenu: getkbdSetModeStarlightAll(device, [0xff, 0x45, 0])
                },

                {
                    label: 'Red and Green',
                    submenu: getkbdSetModeStarlightAll(device, [0xff, 0, 0, 0, 0xff, 0])
                },
                {
                    label: 'Red and Blue',
                    submenu: getkbdSetModeStarlightAll(device, [0xff, 0, 0, 0, 0, 0xff])
                },
                {
                    label: 'Blue and Green',
                    submenu: getkbdSetModeStarlightAll(device, [0, 0, 0xff, 0, 0xff, 0])
                },
            ],
        },
        {
            label: 'Brightness',
            submenu: [
                {
                    label: `Brightness: ${device.brightness}%`,
                },
                { type: 'separator' },
                {
                    label: 'Set to 0%',
                    click() {
                        addon.KbdSetBrightness(device.internalId, 0);
                        refreshTray();
                    },
                },
                {
                    label: 'Set to 100%',
                    click() {
                        addon.KbdSetBrightness(device.internalId, 100);
                        refreshTray();
                    },
                },
            ],
        },
        {
            label: 'Keyboard custom settings',
            click() {
                window.webContents.send('device-selected', {
                    device: device
                });
                window.setSize(500, 450);
                window.show();
            },
        },
    ];
}