import { RazerDevice } from './razerdevice';

export class RazerDeviceAccessory extends RazerDevice {
  constructor(addon, settingsManager, stateManager, razerProperties) {
    super(addon, settingsManager, stateManager, razerProperties);
  }

  setModeNone() {
    super.setModeNone();
    this.addon.accessorySetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    super.setModeStaticNoStore(color);
    this.addon.accessorySetModeStaticNoStore(this.internalId, new Uint8Array(color));
  }

  setModeStatic(color) {
    super.setModeStatic(color);
    this.addon.accessorySetModeStatic(this.internalId, new Uint8Array(color));
  }
  setSpectrum() {
    super.setSpectrum();
    this.addon.accessorySetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    super.setBreathe(color);
    this.addon.accessorySetModeBreathe(this.internalId, new Uint8Array(color));
  }

  //device specific
  setWaveExtended(directionSpeed) {
    this.setModeState('waveExtended', directionSpeed);
    this.addon.accessorySetModeWave(this.internalId, directionSpeed);
  }
}