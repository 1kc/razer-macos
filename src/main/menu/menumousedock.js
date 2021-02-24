import addon from "../../driver";

export function getmouseDockSetModeStatic(device, label, color) {
    return {
        label: label,
        click() {
            addon.mouseDockSetModeStatic(device.internalId, new Uint8Array(color));
        }
    };
}

export function getMouseDockMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: 'No mouse dock found',
            enabled: false,
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.mouseDockSetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getmouseDockSetModeStatic(device, 'Custom color', [customMouseDockColor.rgb.r, customMouseDockColor.rgb.g, customMouseDockColor.rgb.b]),
                getmouseDockSetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getmouseDockSetModeStatic(device, 'Red', [0xff, 0, 0]),
                getmouseDockSetModeStatic(device, 'Green', [0, 0xff, 0]),
                getmouseDockSetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.mouseDockSetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Breathe',
            click() {
                addon.mouseDockSetModeBreathe(
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
                window.setSize(500, 300);
                window.show();
            },
        },
    ];
}