export function getMenuItemSetCustomColor(device, label, razerApp) {
  return {
    label: label,
    click() {
      razerApp.window.webContents.send('render-view', {
        mode: 'device',
        device: device.serialize(),
      });
      razerApp.window.show();
    },
  };
}