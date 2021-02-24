import addon from "../../driver";

export function getaccessorySetModeStatic(device, label, color) {
    return {
        label: label,
        click() {
            addon.accessorySetModeStatic(device.internalId, new Uint8Array(color));
        },
    };
}

export function getaccessorySetModeWaveFor(device, direction) {
    return [
        getaccessorySetModeWave(device, 'Turtle Speed', direction+'_turtle'),
        getaccessorySetModeWave(device, 'Slowest Speed', direction+'_slowest'),
        getaccessorySetModeWave(device, 'Slower Speed', direction+'_slower'),
        getaccessorySetModeWave(device, 'Slow Speed', direction+'_slow'),
        getaccessorySetModeWave(device, 'Normal Speed', direction+'_default'),
        getaccessorySetModeWave(device, 'Fast Speed', direction+'_fast'),
        getaccessorySetModeWave(device, 'Faster Speed', direction+'_faster'),
        getaccessorySetModeWave(device, 'Fastest Speed', direction+'_fastest'),
        getaccessorySetModeWave(device, 'Lightning Speed', direction+'_lightning')
    ]
}

export function getaccessorySetModeWave(device, label, speed) {
    return {
        label: label,
        click() {
            addon.accessorySetModeWave(device.internalId, speed);
        }
    };
}

export function getAccessoryMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: device.getName(),
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.accessorySetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getaccessorySetModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
                getaccessorySetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getaccessorySetModeStatic(device, 'Red', [0xff, 0, 0]),
                getaccessorySetModeStatic(device, 'Green', [0, 0xff, 0]),
                getaccessorySetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Wave',
            submenu: [
                {
                    label: 'Left',
                    submenu: getaccessorySetModeWaveFor(device, 'left')
                },
                {
                    label: 'Right',
                    submenu: getaccessorySetModeWaveFor(device, 'right')
                },
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.accessorySetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Breathe',
            click() {
                addon.accessorySetModeBreathe(
                  device.internalId,
                    new Uint8Array([
                        0, // random
                    ])
                );
            },
        },
        {
            label: 'Set custom color',
            click() {
                window.webContents.send('device-selected', {
                    device: device
                });
                window.setSize(500, 300);
                window.show();
            },
        },
    ];
}