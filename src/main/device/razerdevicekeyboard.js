import { RazerDevice } from './razerdevice';
import { RazerAnimationRipple } from '../animation/animationripple';
import { saveSettingsFor } from '../settingsmanager';

export class RazerDeviceKeyboard extends RazerDevice {
  constructor(addon, razerProperties) {
    super(addon, razerProperties);
    this.rippleAnimation = null;
  }

  async init() {
    this.brightness = this.addon.KbdGetBrightness(this.internalId);
    return super.init();
  }

  getDefaultSettings() {
    return {
      customColor1: this.defaultColorSettings,
      customColor2: this.defaultColorSettings,
      customBrightness: this.getBrightness(),
    }
  }

  setModeNone() {
    this.stopAnimations();
    this.addon.kbdSetModeNone(this.internalId)
  }

  setModeStaticNoStore(color) {
    this.stopAnimations();
    this.addon.kbdSetModeStaticNoStore(this.internalId, color);
  }

  setModeStatic(color) {
    this.stopAnimations();
    this.addon.kbdSetModeStatic(this.internalId, color);
  }

  setSpectrum() {
    this.stopAnimations();
    this.addon.kbdSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    this.stopAnimations();
    this.addon.kbdSetModeBreathe(this.internalId, color);
  }

  //device specific
  setWaveExtended(directionSpeed) {
    this.stopAnimations();
    this.addon.kbdSetModeWave(this.internalId, directionSpeed);
  }
  setReactive(colorMode) {
    this.stopAnimations();
    this.addon.kbdSetModeReactive(this.internalId, colorMode);
  }
  setStarlight(mode) {
    this.stopAnimations();
    this.addon.kbdSetModeStarlight(this.internalId, mode);
  }
  getBrightness() {
    return this.brightness;
  }
  setBrightness(brightness) {
    saveSettingsFor(this);
    this.brightness = brightness;
    this.addon.KbdSetBrightness(this.internalId, brightness);
  }

  stopAnimations() {
    if(this.rippleAnimation != null) {
      this.rippleAnimation.stop();
    }
  }

  setRippleEffect(color, backgroundColor) {
    this.stopAnimations();
    this.rippleAnimation = new RazerAnimationRipple(this, color, backgroundColor);
    this.rippleAnimation.start();
  }

  setCustomFrame(frame) {
    this.addon.kbdSetCustomFrame(this.internalId, frame);
  }
  setModeCustom() {
    this.addon.kbdSetModeCustom(this.internalId);
  }
}