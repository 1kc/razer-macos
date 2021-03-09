import { RazerDevice } from './razerdevice';

export class RazerDeviceHeadphone extends RazerDevice {
  constructor(addon, settingsManager, razerProperties) {
    super(addon, settingsManager, razerProperties);
  }

  setModeNone() {
    this.addon.headphoneSetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.headphoneSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    super.setModeStatic(color);
    this.addon.headphoneSetModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.addon.headphoneSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.headphoneSetModeBreathe(this.internalId, color);
  }
}