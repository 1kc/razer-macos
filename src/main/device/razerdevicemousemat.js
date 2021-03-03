import { RazerDevice } from './razerdevice';

export class RazerDeviceMouseMat extends RazerDevice {
  constructor(addon, settingsManager, razerProperties) {
    super(addon, settingsManager, razerProperties);
  }

  setModeNone() {
    this.addon.mouseMatSetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.mouseMatSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.addon.mouseMatSetModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.addon.mouseMatSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.mouseMatSetModeBreathe(this.internalId, color);
  }

  // device specific
  setWaveSimple(direction) {
    this.addon.mouseMatSetModeWave(this.internalId, direction);
  }
}