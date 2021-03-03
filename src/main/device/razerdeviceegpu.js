import { RazerDevice } from './razerdevice';

export class RazerDeviceEgpu extends RazerDevice {
  constructor(addon, settingsManager, razerProperties) {
    super(addon, settingsManager, razerProperties);
  }

  setModeNone() {
    this.addon.egpuSetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.egpuSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.addon.egpuSetModeStatic(this.internalId, color);
  }
  setSpectrum() {
    this.addon.egpuSetModeSpectrum(this.internalId);
  }
  setBreathe(color) {
    this.addon.egpuSetModeBreathe(this.internalId, color);
  }

  //device specific
  setWaveSimple(direction) {
    this.addon.egpuSetModeWave(this.internalId, direction);
  }
}