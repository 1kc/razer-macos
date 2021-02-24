import addon from "../../driver";

export function getheadphoneSetModeStatic(device, label, color) {
    return {
        label: label,
        click() {
            addon.headphoneSetModeStatic(device.internalId, new Uint8Array(color));
        },
    };
}

export function getHeadphoneMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: device.getName(),
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.headphoneSetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getheadphoneSetModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
                getheadphoneSetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getheadphoneSetModeStatic(device, 'Red', [0xff, 0, 0]),
                getheadphoneSetModeStatic(device, 'Green', [0, 0xff, 0]),
                getheadphoneSetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.headphoneSetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Breathe',
            click() {
                addon.headphoneSetModeBreathe(
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