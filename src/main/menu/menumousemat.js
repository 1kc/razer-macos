import addon from "../../driver";

export function getmouseMatSetModeStatic(device, label, color) {
    return {
        label: label,
        click() {
            addon.mouseMatSetModeStatic(device.internalId, new Uint8Array(color));
        }
    };
}

export function getMouseMatMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: device.getName(),
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.mouseMatSetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getmouseMatSetModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.g, device.settings.customColor1.rgb.b]),
                getmouseMatSetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getmouseMatSetModeStatic(device, 'Red', [0xff, 0, 0]),
                getmouseMatSetModeStatic(device, 'Green', [0, 0xff, 0]),
                getmouseMatSetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Wave',
            submenu: [
                {
                    label: 'Left',
                    click() {
                        addon.mouseMatSetModeWave(device.internalId, 'left');
                    },
                },
                {
                    label: 'Right',
                    click() {
                        addon.mouseMatSetModeWave(device.internalId, 'right');
                    },
                },
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.mouseMatSetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Breathe',
            click() {
                addon.mouseMatSetModeBreathe(
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
                    device: device,
                });
                window.setSize(500, 400);
                window.show();
            },
        },
    ];
}