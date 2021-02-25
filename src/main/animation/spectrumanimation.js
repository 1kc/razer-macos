export async function getSpectrumAnimation(app) {
  const spectrumColors = [
    { r: 0xff, g: 0x00, b: 0x00 },
    { r: 0xff, g: 0x77, b: 0x00 },
    { r: 0xff, g: 0xff, b: 0x00 },
    { r: 0x77, g: 0xff, b: 0x00 },
    { r: 0x00, g: 0xff, b: 0x00 },
    { r: 0x00, g: 0xff, b: 0x77 },
    { r: 0x00, g: 0xff, b: 0xff },
    { r: 0x00, g: 0x77, b: 0xff },
    { r: 0x00, g: 0x00, b: 0xff },
    { r: 0x77, g: 0x00, b: 0xff },
    { r: 0xff, g: 0x00, b: 0xff },
    { r: 0xff, g: 0x00, b: 0x77 },
  ];
  let cycleColorsIndex = 0;
  let cycleColorsInterval = null;

  function setDevicesCycleColors() {
    app.deviceManager.activeRazerDevices.forEach(device => {
      device.setModeStaticNoStore(new Uint8Array([
        spectrumColors[cycleColorsIndex].r,
        spectrumColors[cycleColorsIndex].g,
        spectrumColors[cycleColorsIndex].b,
      ]));
    });

    cycleColorsIndex++;
    if (cycleColorsIndex >= spectrumColors.length) {
      cycleColorsIndex = 0;
    }
  }

  return {
    start: () => {
      clearInterval(cycleColorsInterval);
      cycleColorsIndex = 0;
      setDevicesCycleColors(spectrumColors);
      cycleColorsInterval = setInterval(setDevicesCycleColors, 4000);
    },
    stop: () => {
      clearInterval(cycleColorsInterval);
    }
  };
}