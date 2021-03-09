import { RazerDevice } from './razerdevice';

export class RazerDeviceMouseDock extends RazerDevice {
  constructor(addon, settingsManager, razerProperties) {
    super(addon, settingsManager, razerProperties);
  }

  setModeNone() {
    this.addon.mouseDockSetModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    this.addon.mouseDockSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    super.setModeStatic(color);
    this.addon.mouseDockSetModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.addon.mouseDockSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.addon.mouseDockSetModeBreathe(this.internalId, color);
  }
}