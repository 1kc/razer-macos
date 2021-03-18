export class StateManager {

  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.settingsKey = 'statemanager';
    this.devices = [];

    this.savedStates = [];

    this.stateOnRefresh = null;
    this.stateOnWake = null;
    this.stateOnSleep = null;
  }

  async init(devices) {
    this.devices = devices;
    try {
      if (await this.settingsManager.hasKey(this.settingsKey)) {
        const savedState = await this.settingsManager.getKey(this.settingsKey);
        this.savedStates = savedState.savedStates;
        this.stateOnSleep = savedState.stateOnSleep;
        this.stateOnRefresh = savedState.stateOnRefresh;
        this.stateOnWake = savedState.stateOnWake;
      } else {
        await this.createNewState();
      }
    } catch {
      await this.createNewState();
    }

    //check for resets on load
    if (this.stateOnRefresh != null) {
      return this.activateState(this.stateOnRefresh);
    }
  }

  async createNewState() {
    this.savedStates = this.getDefaultStates();
    this.stateOnSleep = null;
    this.stateOnRefresh = null;
    this.stateOnWake = null;
    await this.save();
  }

  async sleep() {
    if (this.stateOnSleep != null) {
      return this.activateState(this.stateOnSleep);
    }
  }

  async wakeUp() {
    if (this.stateOnWake != null) {
      return this.activateState(this.stateOnWake);
    }
  }

  getDefaultStates() {
    const idleState = {
      name: 'All lights off',
      states: this.devices.map(device => {
        const currentState = device.getState();
        currentState.mode = 'none';
        currentState.args = null;
        return {
          deviceId: device.productId,
          state: currentState,
        };
      }),
    };
    return [idleState];
  }

  async save() {
    return await this.settingsManager.setKey(this.settingsKey, {
      savedStates: this.savedStates,
      stateOnSleep: this.stateOnSleep,
      stateOnRefresh: this.stateOnRefresh,
      stateOnWake: this.stateOnWake,
    });
  }

  activateState(stateName) {
    const state = this.savedStates.find(s => s.name === stateName);
    if (state == null) {
      console.error('State "' + state + '" is not a valid state.');
      return;
    }
    state.states.forEach(stateObj => {
      const device = this.devices.find(d => d.productId === stateObj.deviceId);
      if (device != null) {
        device.resetToState(stateObj.state);
      } else {
        console.warn('Device with id "' + stateObj.deviceId + '" has not been found and was skipped.');
      }
    });
  }

  async addState(stateName) {
    const newState = {
      name: stateName,
      states: this.devices.map(device => {
        return {
          deviceId: device.productId,
          state: device.getState(),
        };
      }),
    };
    this.savedStates.push(newState);
    await this.save();
    return newState;
  }

  async removeState(stateName) {
    this.savedStates = this.savedStates.filter(state => state.name !== stateName);
    if (this.stateOnWake === stateName) {
      this.stateOnWake = null;
    }
    if (this.stateOnSleep === stateName) {
      this.stateOnSleep = null;
    }
    if (this.stateOnRefresh === stateName) {
      this.stateOnRefresh = null;
    }
    await this.save();
  }

  resetStateFor(device, state) {
    if (state.mode == null) {
      console.warn('State mode has never been set. Can\'t reset to undefined state');
      return;
    }
    switch (state.mode) {
      case 'none':
        device.setModeNone();
        break;
      case 'staticNoStore':
        device.setModeStaticNoStore(state.args);
        break;
      case 'static':
        device.setModeStatic(state.args);
        break;
      case 'spectrum':
        device.setSpectrum();
        break;
      case 'breathe':
        device.setBreathe(state.args);
        break;
      case 'waveSimple':
        device.setWaveSimple(state.args);
        break;
      case 'waveExtended':
        device.setWaveExtended(state.args);
        break;
      case 'reactive':
        device.setReactive(state.args);
        break;
      case 'starlight':
        device.setStarlight(state.args);
        break;
      case 'ripple':
        device.setRippleEffect(state.args[0], state.args[1]);
        break;
      default:
        console.error('Unknown State mode ' + state.mode);
    }
  }

  serialize() {
    return {
      devices: this.devices.map(device => device.serialize()),
      savedStates: this.savedStates,
      stateOnRefresh: this.stateOnRefresh,
      stateOnWake: this.stateOnWake,
      stateOnSleep: this.stateOnSleep,
    };
  }
}