import addon from "../../driver";

export function getegpuSetModeStatic(device, label, color) {
    return {
        label: label,
        click() {
            addon.egpuSetModeStatic(device.internalId, new Uint8Array(color));
        }
    };
}

export function getEGPUMenuFor(device) {
    return [
        { type: 'separator' },
        {
            label: device.getName(),
        },
        { type: 'separator' },
        {
            label: 'None',
            click() {
                addon.egpuSetModeNone(device.internalId);
            },
        },
        {
            label: 'Static',
            submenu: [
                getegpuSetModeStatic(device, 'Custom color', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
                getegpuSetModeStatic(device, 'White', [0xff, 0xff, 0xff]),
                getegpuSetModeStatic(device, 'Red', [0xff, 0, 0]),
                getegpuSetModeStatic(device, 'Green', [0, 0xff, 0]),
                getegpuSetModeStatic(device, 'Blue', [0, 0, 0xff])
            ],
        },
        {
            label: 'Wave',
            submenu: [
                {
                    label: 'Left',
                    click() {
                        addon.egpuSetModeWave(device.internalId, 'left');
                    },
                },
                {
                    label: 'Right',
                    click() {
                        addon.egpuSetModeWave(device.internalId, 'right');
                    },
                },
            ],
        },
        {
            label: 'Spectrum',
            click() {
                addon.egpuSetModeSpectrum(device.internalId);
            },
        },
        {
            label: 'Breathe',
            click() {
                addon.egpuSetModeBreathe(
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