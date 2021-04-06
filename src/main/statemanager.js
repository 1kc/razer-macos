export class StateManager {

  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.settingsKey = 'statemanager';
    this.devices = [];

    this.savedStates = [];
  }

  async init(devices, withOnStartState) {
    this.devices = devices;
    try {
      if (await this.settingsManager.hasKey(this.settingsKey)) {
        const savedState = await this.settingsManager.getKey(this.settingsKey);
        this.savedStates = savedState.savedStates;
        this.stateOnStart = savedState.stateOnStart;
        this.stateOnResume = savedState.stateOnResume;
        this.stateOnSuspend = savedState.stateOnSuspend;
        this.stateOnAc = savedState.stateOnAc;
        this.stateOnBattery = savedState.stateOnBattery;
        this.stateOnShutdown = savedState.stateOnShutdown;
        this.stateOnLockScreen = savedState.stateOnLockScreen;
        this.stateOnUnlockScreen = savedState.stateOnUnlockScreen;
        this.stateOnUserDidBecomeActive = savedState.stateOnUserDidBecomeActive;
        this.stateOnUserDidResignActive = savedState.stateOnUserDidResignActive;
      } else {
        await this.createNewState();
      }
    } catch {
      await this.createNewState();
    }

    //check for resets on load
    if(withOnStartState) {
      await this.changeToState(this.stateOnStart);
    }
  }

  async createNewState() {
    this.savedStates = this.getDefaultStates();
    this.stateOnStart = null;
    this.stateOnResume = null;
    this.stateOnSuspend = null;
    this.stateOnAc = null;
    this.stateOnBattery = null;
    this.stateOnShutdown = null;
    this.stateOnLockScreen = null;
    this.stateOnUnlockScreen = null;
    this.stateOnUserDidBecomeActive = null;
    this.stateOnUserDidResignActive = null;
    await this.save();
  }

  async changeToState(state) {
    if (state != null && this.savedStates != null && this.savedStates.find(s => s.name == state)) {
      await this.activateState(state);
    }
  }

  async suspend() {
    return this.changeToState(this.stateOnSuspend);
  }
  async resume() {
    return this.changeToState(this.stateOnResume);
  }
  async onAc() {
    return this.changeToState(this.stateOnAc);
  }
  async onBattery() {
    return this.changeToState(this.stateOnBattery);
  }
  async shutdown() {
    return this.changeToState(this.stateOnShutdown);
  }
  async lockScreen() {
    return this.changeToState(this.stateOnLockScreen);
  }
  async unlockScreen() {
    return this.changeToState(this.stateOnUnlockScreen);
  }
  async userDidBecomeActive() {
    return this.changeToState(this.stateOnUserDidBecomeActive);
  }
  async userDidResignActive() {
    return this.changeToState(this.stateOnUserDidResignActive);
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
      stateOnStart: this.stateOnStart,
      stateOnResume: this.stateOnResume,
      stateOnSuspend: this.stateOnSuspend,
      stateOnAc: this.stateOnAc,
      stateOnBattery: this.stateOnBattery,
      stateOnShutdown: this.stateOnShutdown,
      stateOnLockScreen: this.stateOnLockScreen,
      stateOnUnlockScreen: this.stateOnUnlockScreen,
      stateOnUserDidBecomeActive: this.stateOnUserDidBecomeActive,
      stateOnUserDidResignActive: this.stateOnUserDidResignActive,
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
        device.setRippleEffect(state.args[0], state.args[1], state.args[2]);
        break;
      case 'wheel':
        device.setWheelEffect(state.args[0], state.args[1]);
        break;
      default:
        console.error('Unknown State mode ' + state.mode);
    }
  }

  serialize() {
    return {
      devices: this.devices.map(device => device.serialize()),
      savedStates: this.savedStates,
      stateOnStart: this.stateOnStart,
      stateOnResume: this.stateOnResume,
      stateOnSuspend: this.stateOnSuspend,
      stateOnAc: this.stateOnAc,
      stateOnBattery: this.stateOnBattery,
      stateOnShutdown: this.stateOnShutdown,
      stateOnLockScreen: this.stateOnLockScreen,
      stateOnUnlockScreen: this.stateOnUnlockScreen,
      stateOnUserDidBecomeActive: this.stateOnUserDidBecomeActive,
      stateOnUserDidResignActive: this.stateOnUserDidResignActive,
    };
  }
}