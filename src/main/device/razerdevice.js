export class RazerDevice {
  constructor(addon, settingsManager, stateManager, razerDeviceProperties) {
    this.addon = addon;
    this.settingsManager = settingsManager;
    this.stateManager = stateManager;

    this.name = razerDeviceProperties.name;
    this.productId = razerDeviceProperties.productId;
    this.internalId = razerDeviceProperties.internalId;
    this.mainType = razerDeviceProperties.mainType;
    this.image = razerDeviceProperties.image;
    this.features = razerDeviceProperties.features;

    this.defaultColorSettings = {
      hex: '#ffff00',
      rgb: {
        r: 255,
        g: 255,
        b: 0,
      },
    };
    this.activeMode = null;
    this.activeModeArguments = null;
  }

  async init() {
    this.settings = await this.settingsManager.getSettingsFor(this);
    return this;
  }

  getSettingsKey() {
    return 'razer_' + this.productId;
  }

  getDefaultSettings() {
    return {
      customColor1: this.defaultColorSettings,
    };
  }

  refresh() {}

  destroy() {
    this.addon = null;
  }

  async setSettings(settings) {
    this.settings = settings;
    return this.settingsManager.saveSettingsFor(this);
  }

  getState() {
    return {
      mode: this.activeMode,
      args: this.activeModeArguments,
    };
  }

  resetToState(state) {
    this.stateManager.resetStateFor(this, state);
  }

  hasFeature(featureIdentifier) {
    return typeof this.getFeature(featureIdentifier) !== 'undefined';
  }
  getFeature(featureIdentifier) {
    return this.features.find(
      (feature) => feature.featureIdentifier === featureIdentifier
    );
  }

  //override in device types
  setModeNone() {
    try {
      this.setModeState('none');
    } catch (error) {
      throw new Error(`Failed to set mode none: ${error.message}`);
    }
  }

  setModeStaticNoStore(color) {
    try {
      if (!color) {
        throw new Error('Color parameter is required');
      }
      this.setModeState('staticNoStore', color);
    } catch (error) {
      throw new Error(`Failed to set static no store mode: ${error.message}`);
    }
  }

  setModeStatic(color) {
    try {
      if (!color) {
        throw new Error('Color parameter is required');
      }
      this.setModeState('static', color);
    } catch (error) {
      throw new Error(`Failed to set static mode: ${error.message}`);
    }
  }

  setSpectrum() {
    try {
      this.setModeState('spectrum');
    } catch (error) {
      throw new Error(`Failed to set spectrum mode: ${error.message}`);
    }
  }

  setBreathe(color) {
    try {
      if (!color) {
        throw new Error('Color parameter is required');
      }
      this.setModeState('breathe', color);
    } catch (error) {
      throw new Error(`Failed to set breathe mode: ${error.message}`);
    }
  }

  /*protected*/
  setModeState(mode, modeArguments = null) {
    this.activeMode = mode;
    this.activeModeArguments = modeArguments;
  }

  getSerializeIgnoredProperties() {
    return ['addon', 'settingsManager', 'stateManager'];
  }

  serialize() {
    const ignoreProperties = this.getSerializeIgnoredProperties();
    const serializedDevice = {};
    Object.entries(this)
      .filter(([key]) => !ignoreProperties.find((ignored) => ignored === key))
      .forEach(([key, value]) => {
        serializedDevice[key] = value;
      });
    serializedDevice['state'] = this.getState();
    return serializedDevice;
  }
}