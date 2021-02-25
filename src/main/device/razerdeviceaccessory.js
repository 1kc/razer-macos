import { RazerDevice } from './razerdevice';

export class RazerDeviceAccessory extends RazerDevice {
  constructor(addon, razerProperties) {
    super(addon, razerProperties);
  }

  setModeNone() {
    this.addon.accessorySetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.accessorySetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.addon.accessorySetModeStatic(this.internalId, color);
  }
  setSpectrum() {
    this.addon.accessorySetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.accessorySetModeBreathe(this.internalId, color);
  }

  //device specific
  setWaveExtended(directionSpeed) {
    this.addon.accessorySetModeWave(this.internalId, directionSpeed);
  }
}