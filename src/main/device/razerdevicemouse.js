import { RazerDevice } from './razerdevice';
import { FeatureIdentifier } from '../feature/featureidentifier';

export class RazerDeviceMouse extends RazerDevice {
  constructor(addon, settingsManager, stateManager, razerProperties) {
    super(addon, settingsManager, stateManager, razerProperties);
  }

  async init() {
    this.batteryLevel = this.addon.getBatteryLevel(this.internalId);
    this.chargingStatus = this.addon.getChargingStatus(this.internalId);

    this.dpi = this.addon.mouseGetDpi(this.internalId);
    this.pollRate = this.addon.mouseGetPollRate(this.internalId);

    const featureMouseBrightness = this.getFeature(FeatureIdentifier.MOUSE_BRIGHTNESS);

    if(typeof featureMouseBrightness !== 'undefined') {
      if(featureMouseBrightness.configuration.enabledMatrix) {
        this.brightness = this.addon.mouseGetBrightness(this.internalId);
      }
      if(featureMouseBrightness.configuration.enabledLogo) {
        this.brightnessLogo = this.addon.mouseGetLogoBrightness(this.internalId);
      }
      if(featureMouseBrightness.configuration.enabledScroll) {
        this.brightnessScroll = this.addon.mouseGetScrollBrightness(this.internalId);
      }
      if(featureMouseBrightness.configuration.enabledLeft) {
        this.brightnessLeft = this.addon.mouseGetLeftBrightness(this.internalId);
      }
      if(featureMouseBrightness.configuration.enabledRight) {
        this.brightnessRight = this.addon.mouseGetRightBrightness(this.internalId);
      }
    }

    return super.init();
  }

  getDefaultSettings() {
    return {
      customSensitivity: this.getDPI(),
      customColor1: this.defaultColorSettings,
    }
  }

  getState() {
    const deviceState = super.getState();
    deviceState['dpi'] = this.dpi;
    deviceState['pollRate'] = this.pollRate;

    const featureMouseBrightness = this.getFeature(FeatureIdentifier.MOUSE_BRIGHTNESS);
    if(typeof featureMouseBrightness !== 'undefined') {
      if(featureMouseBrightness.configuration.enabledMatrix) {
        deviceState['brightness'] = this.brightness;
      }
      if(featureMouseBrightness.configuration.enabledLogo) {
        deviceState['brightnessLogo'] = this.brightnessLogo;
      }
      if(featureMouseBrightness.configuration.enabledScroll) {
        deviceState['brightnessScroll'] = this.brightnessScroll;
      }
      if(featureMouseBrightness.configuration.enabledLeft) {
        deviceState['brightnessLeft'] = this.brightnessLeft;
      }
      if(featureMouseBrightness.configuration.enabledRight) {
        deviceState['brightnessRight'] = this.brightnessRight;
      }
    }
    return deviceState;
  }

  resetToState(state) {
    super.resetToState(state);
    this.setDPI(state.dpi);
    this.setPollRate(state.pollRate);

    const featureMouseBrightness = this.getFeature(FeatureIdentifier.MOUSE_BRIGHTNESS);
    if(typeof featureMouseBrightness !== 'undefined') {
      if(featureMouseBrightness.configuration.enabledMatrix) {
        if(typeof state.brightness !== 'undefined') {
          this.setBrightnessMatrix(state.brightness);
        }
      }
      if(featureMouseBrightness.configuration.enabledLogo) {
        this.setBrightnessLogo(state.brightnessLogo);
      }
      if(featureMouseBrightness.configuration.enabledScroll) {
        this.setBrightnessScroll(state.brightnessScroll);
      }
      if(featureMouseBrightness.configuration.enabledLeft) {
        this.setBrightnessLeft(state.brightnessLeft);
      }
      if(featureMouseBrightness.configuration.enabledRight) {
        this.setBrightnessRight(state.brightnessRight);
      }
    }
  }

  setModeNone() {
    super.setModeNone();
    this.addon.mouseSetLogoModeNone(this.internalId);
  }

  setModeStaticNoStore(color) {
    super.setModeStaticNoStore(color);
    this.addon.mouseSetLogoModeStaticNoStore(this.internalId, new Uint8Array(color));
  }

  setModeStatic(color) {
    super.setModeStatic(color);
    this.addon.mouseSetLogoModeStatic(this.internalId, new Uint8Array(color));
  }

  setSpectrum() {
    super.setSpectrum();
    this.addon.mouseSetLogoModeSpectrum(this.internalId);
  }

  setBreathe(color) {
    super.setBreathe(color);
    this.addon.mouseSetLogoModeBreathe(this.internalId, new Uint8Array(color));
  }

  // device specific
  setWaveSimple(direction) {
    this.setModeState('waveSimple', direction);
    this.addon.mouseSetLogoModeWave(this.internalId, direction);
  }
  setReactive(colorMode) {
    this.setModeState('reactive', colorMode);
    this.addon.mouseSetLogoModeReactive(this.internalId, new Uint8Array(colorMode));
  }
  setLogoLEDEffect(effect) {
    this.setModeState('ledEffect', effect);
    this.addon.mouseSetLogoLEDEffect(this.internalId, effect);
  }

  getDPI() {
    return this.dpi;
  }
  setDPI(dpi) {
    this.dpi = dpi;
    this.addon.mouseSetDpi(this.internalId, dpi);
  }

  getBrightnessMatrix() {
    return this.brightness;
  }
  setBrightnessMatrix(brightness) {
    this.brightness = brightness;
    this.addon.mouseSetBrightness(this.internalId, this.brightness);
  }

  getBrightnessLogo() {
    return this.brightnessLogo;
  }
  setBrightnessLogo(brightness) {
    this.brightnessLogo = brightness;
    this.addon.mouseSetLogoBrightness(this.internalId, this.brightnessLogo);
  }

  getBrightnessScroll() {
    return this.brightnessScroll;
  }
  setBrightnessScroll(brightness) {
    this.brightnessScroll = brightness;
    this.addon.mouseSetScrollBrightness(this.internalId, this.brightnessScroll);
  }

  getBrightnessLeft() {
    return this.brightnessLeft;
  }
  setBrightnessLeft(brightness) {
    this.brightnessLeft = brightness;
    this.addon.mouseSetLeftBrightness(this.internalId, this.brightnessLeft);
  }

  getBrightnessRight() {
    return this.brightnessRight;
  }
  setBrightnessRight(brightness) {
    this.brightnessRight = brightness;
    this.addon.mouseSetRightBrightness(this.internalId, this.brightnessRight);
  }

  getPollRate() {
    return this.pollRate;
  }
  setPollRate(pollRate) {
    this.pollRate = pollRate;
    this.addon.mouseSetPollRate(this.internalId, this.pollRate);
  }
}