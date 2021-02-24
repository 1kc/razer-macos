import { RazerDevice } from './razerdevice';

export class RazerDeviceKeyboard extends RazerDevice {
  constructor(razerProperties) {
    super(razerProperties);
  }

  async init(addon) {
    await super.init(addon);
    this.brightness = addon.KbdGetBrightness(this.internalId);
    return this;
  }
}