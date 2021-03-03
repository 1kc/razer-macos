const storage = require('electron-json-storage');

export async function getSettingsFor(device) {
  if (await hasKey(device.getSettingsKey())) {
    return getKey(device.getSettingsKey());
  }
  return device.getDefaultSettings();
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