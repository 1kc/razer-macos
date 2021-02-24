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
    app.activeRazerDevices.forEach(device => {
      let setModeStaticNoStoreFunc = () => {};
      if(device.mainType === "accessory") {
        setModeStaticNoStoreFunc = app.addon.accessorySetModeStaticNoStore;
      } else if(device.mainType === "egpu") {
        setModeStaticNoStoreFunc = app.addon.egpuSetModeStaticNoStore;
      } else if(device.mainType === "headphone") {
        setModeStaticNoStoreFunc = app.addon.headphoneSetModeStaticNoStore;
      } else if(device.mainType === "keyboard") {
        setModeStaticNoStoreFunc = app.addon.kbdSetModeStaticNoStore;
      } else if(device.mainType === "mouse") {
        setModeStaticNoStoreFunc = app.addon.mouseSetLogoModeStaticNoStore;
      } else if(device.mainType === "mousedock") {
        setModeStaticNoStoreFunc = app.addon.mouseDockSetModeStaticNoStore;
      } else if(device.mainType === "mousemat") {
        setModeStaticNoStoreFunc = app.addon.mouseMatSetModeStaticNoStore;
      }

      setModeStaticNoStoreFunc(device.internalId, new Uint8Array([
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