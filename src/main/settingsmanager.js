const storage = require('electron-json-storage');

export async function getSettingsFor(device) {
  if (await hasKey(device.getSettingsKey())) {
    return getKey(device.getSettingsKey());
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

async function createStandardSettingsFor(device) {

  const whiteColorSetting = {
    hex: '#ffff00',
    rgb: {
      r: 255,
      g: 255,
      b: 0,
    },
  };
  let settings;
  switch (device.mainType) {
    case 'keyboard':
      settings = {
        customColor1: whiteColorSetting,
        customColor2: whiteColorSetting,
        customBrightness: device.getBrightness(),
      };
      break;
    case 'mouse':
      settings =  {
        customSensitivity: device.getDPI(),
        customColor1: whiteColorSetting,
      };
      break;
    default:
      settings = {
        customColor1: whiteColorSetting,
      };
  }

  return Promise.resolve(settings);
}

export function clearAllSettings() {
  return new Promise((res, rej) => {
    storage.clear((err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
}