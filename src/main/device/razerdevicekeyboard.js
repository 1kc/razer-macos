import { RazerDevice } from './razerdevice';

export class RazerDeviceKeyboard extends RazerDevice {
  constructor(addon, razerProperties) {
    super(addon, razerProperties);
  }

  async init() {
    await super.init();
    this.brightness = this.addon.KbdGetBrightness(this.internalId);
    return this;
  }

  setModeNone() {
    this.addon.kbdSetModeNone(this.internalId)
  }

  setModeStaticNoStore(color) {
    this.addon.kbdSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.addon.kbdSetModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.addon.kbdSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.kbdSetModeBreathe(this.internalId, color);
  }

  //device specific
  setWaveExtended(directionSpeed) {
    this.addon.kbdSetModeWave(this.internalId, directionSpeed);
  }
  setReactive(colorMode) {
    this.addon.kbdSetModeReactive(this.internalId, colorMode);
  }
  setStarlight(mode) {
    this.addon.kbdSetModeStarlight(this.internalId, mode);
  }
  setBrightness(brightness) {
    this.brightness = brightness;
    this.addon.KbdSetBrightness(this.internalId, brightness);
  }
}