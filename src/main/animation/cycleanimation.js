import { getKey, hasKey, setKey } from '../settingsmanager';

//TODO create class and dedupe setDevicesCycleColors
export async function getCycleAnimation(app) {

  let cycleColors = [
    { r: 0xff, g: 0x00, b: 0x00 },
    { r: 0x00, g: 0xff, b: 0x00 },
    { r: 0x00, g: 0x00, b: 0xff },
  ];
  if(await hasKey('cycleColors')) {
    cycleColors = await getKey('cycleColors');
  }

  let cycleColorsIndex = 0;
  let cycleColorsInterval = null;

  function setDevicesCycleColors() {
    app.deviceManager.activeRazerDevices.forEach(device => {
      device.setModeStaticNoStore(new Uint8Array([
        cycleColors[cycleColorsIndex].r,
        cycleColors[cycleColorsIndex].g,
        cycleColors[cycleColorsIndex].b,
      ]));
    });

    cycleColorsIndex++;
    if (cycleColorsIndex >= cycleColors.length) {
      cycleColorsIndex = 0;
    }
  }

  return {
    start: () => {
      clearInterval(cycleColorsInterval);
      cycleColorsIndex = 0;
      setDevicesCycleColors(cycleColors);
      cycleColorsInterval = setInterval(setDevicesCycleColors,4000);
    },
    stop: () => {
      clearInterval(cycleColorsInterval);
    },
    getAllColors: () => cycleColors,
    getColor: (index) => cycleColors[index],
    addColor: (color) => {
      cycleColors = cycleColors.concat(color);
      setKey('cycleColors', cycleColors);
    },
    setColor: (colors) => {
      cycleColors = colors;
      setKey('cycleColors', cycleColors);
    }
  };
}