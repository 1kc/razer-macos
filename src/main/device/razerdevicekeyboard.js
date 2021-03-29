import { RazerDevice } from './razerdevice';
import { RazerAnimationRipple } from '../animation/animationripple';

export class RazerDeviceKeyboard extends RazerDevice {
  constructor(addon, settingsManager, stateManager, razerProperties) {
    super(addon, settingsManager, stateManager, razerProperties);
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

  getSerializeIgnoredProperties() {
    return super.getSerializeIgnoredProperties().concat(['rippleAnimation']);
  }

  getState() {
    const deviceState = super.getState();
    deviceState['brightness'] = this.brightness;
    return deviceState;
  }

  resetToState(state) {
    super.resetToState(state);
    this.setBrightness(state.brightness);
  }

  destroy() {
    super.destroy();
    if(this.rippleAnimation != null) {
      this.rippleAnimation.destroy();
    }
  }

  setModeNone() {
    super.setModeNone();
    this.stopAnimations();
    this.addon.kbdSetModeNone(this.internalId)
  }

  setModeStaticNoStore(color) {
    super.setModeStaticNoStore(color);
    this.stopAnimations();
    this.addon.kbdSetModeStaticNoStore(this.internalId, new Uint8Array(color));
  }

  setModeStatic(color) {
    super.setModeStatic(color);
    this.stopAnimations();
    this.addon.kbdSetModeStatic(this.internalId, new Uint8Array(color));
  }

  setSpectrum() {
    super.setSpectrum();
    this.stopAnimations();
    this.addon.kbdSetModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    super.setBreathe(color);
    this.stopAnimations();
    this.addon.kbdSetModeBreathe(this.internalId, new Uint8Array(color));
  }

  //device specific
  setWaveExtended(directionSpeed) {
    this.setModeState('waveExtended', directionSpeed);
    this.stopAnimations();
    this.addon.kbdSetModeWave(this.internalId, directionSpeed);
  }
  setReactive(colorMode) {
    this.setModeState('reactive', colorMode);
    this.stopAnimations();
    this.addon.kbdSetModeReactive(this.internalId, new Uint8Array(colorMode));
  }
  setStarlight(mode) {
    this.setModeState('starlight', mode);
    this.stopAnimations();
    this.addon.kbdSetModeStarlight(this.internalId, new Uint8Array(mode));
  }

  getBrightness() {
    return this.brightness;
  }
  setBrightness(brightness) {
    this.brightness = brightness;
    this.addon.KbdSetBrightness(this.internalId, brightness);
  }

  stopAnimations() {
    if(this.rippleAnimation != null) {
      this.rippleAnimation.stop();
    }
  }

  setRippleEffect(featureConfiguration, color, backgroundColor) {
    this.setModeState('ripple', [featureConfiguration, color, backgroundColor]);
    this.stopAnimations();
    this.rippleAnimation = new RazerAnimationRipple(this, featureConfiguration, color, backgroundColor);
    this.rippleAnimation.start();
  }

  setCustomFrame(frame) {
    this.addon.kbdSetCustomFrame(this.internalId, new Uint8Array(frame));
  }
  setModeCustom() {
    this.addon.kbdSetModeCustom(this.internalId);
  }
}