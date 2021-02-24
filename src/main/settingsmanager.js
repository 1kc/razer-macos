const storage = require('electron-json-storage');

export async function getSettingsFor(device) {
  if (await hasKey(device.getSettingsKey())) {
    return await getKey(device.getSettingsKey());
  }
  return createStandardSettingsFor(device);
}

export async function saveSettingsFor(device) {
  return setKey(device.getSettingsKey(), device.settings);
}

export async function hasKey(key) {
  return new Promise((res, rej) => {
    storage.has(key, (error, hasKey) => {
      if (error) {
        rej(error);
      }
      res(hasKey);
    });
  });
}

export async function setKey(key, value) {
  return new Promise((res, rej) => {
    storage.set(key, value, (err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
}

export async function getKey(key) {
  return new Promise((res, rej) => {
    storage.get(key, (err, data) => {
      if (err) {
        rej(err);
      }
      res(data);
    });
  });
}

export function createStandardSettingsFor(device) {
  const whiteColorSetting = {
    hex: '#ffff00',
    rgb: {
      r: 255,
      g: 255,
      b: 0,
    },
  };
  switch (device.mainType) {
    case 'keyboard':
      return {
        customColor1: whiteColorSetting,
        customColor2: whiteColorSetting,
        customBrightness: 50,
      };
    case 'mouse':
      return {
        customSensitivity: 3200,
        customColor1: whiteColorSetting,
      };
    default:
      return {
        customColor1: whiteColorSetting,
      };
  }
}