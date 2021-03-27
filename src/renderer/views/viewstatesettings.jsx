import React from 'react';
import { ipcRenderer } from 'electron';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Creatable from 'react-select/creatable';
import Select from 'react-select';

export class ViewStateSettings extends React.Component {

  constructor(props) {
    super(props);
    this.stateManager = this.props.config.state;
    const options = this.stateManager.savedStates.map(state => {
      return { value: state.name, label: state.name };
    });
    const optionsWithNull = this.getOptionsWithNull(options);

    console.log(this.stateManager)

    this.state = {
      selection: null,
      options: options,
      isLoading: false,

      optionsWithNull: optionsWithNull,
      selectionStart: optionsWithNull.find(o => o.value === this.stateManager.stateOnStart),
      selectionResume: optionsWithNull.find(o => o.value === this.stateManager.stateOnResume),
      selectionSuspend: optionsWithNull.find(o => o.value === this.stateManager.stateOnSuspend),
      selectionAc: optionsWithNull.find(o => o.value === this.stateManager.stateOnAc),
      selectionBatt: optionsWithNull.find(o => o.value === this.stateManager.stateOnBattery),
      selectionShutdown: optionsWithNull.find(o => o.value === this.stateManager.stateOnShutdown),
      selectionLockscreen: optionsWithNull.find(o => o.value === this.stateManager.stateOnLockScreen),
      selectionUnlockscreen: optionsWithNull.find(o => o.value === this.stateManager.stateOnUnlockScreen),
      selectionUserDidBecomeActive: optionsWithNull.find(o => o.value === this.stateManager.stateOnUserDidBecomeActive),
      selectionUserDidResignActive: optionsWithNull.find(o => o.value === this.stateManager.stateOnUserDidResignActive),
    }
  }

  getOptionsWithNull(options) {
    return [{
      value: null, label: '--- Default: do nothing ---'
    }].concat(options);
  }

  getPropertiesToKeyValues(object) {
    return Object.entries(object).map(([key, value]) => {
      return <div key={key} className='state-device-body-properties'>
        <div>{key.toUpperCase()}</div>
        <div>{JSON.stringify(value)}</div>
      </div>
    });
  }

  getDeviceStateFor(device, state) {
    return (<div key={device.productId} className='state-device'>
      <div className='state-device-title'>{device.name}</div>
      <div className='state-device-body'>{this.getPropertiesToKeyValues(state)}</div>
    </div>);
  }

  selectionChange(item, actionObject) {
    if(actionObject.action === 'clear') {
      if(window.confirm('Do you really want to remove state "'+this.state.selection.label+'"?')) {
        const toDeleteItem = this.state.selection.value;
        ipcRenderer.send('state-settings-remove', toDeleteItem);
        const newOptions = this.state.options.filter(o => o.value !== toDeleteItem);
        this.setState({ selection: null, options: newOptions });
      }
    } else {
      this.setState({ selection: item });
    }
  }

  handleCreate(itemName) {
    this.setState({ isLoading: true });

    const additionalState = ipcRenderer.sendSync('state-settings-add', itemName);
    this.stateManager.savedStates.push(additionalState);

    const devicesWithUndefinedState = additionalState.states.filter(stateObj => !stateObj.state.mode).map(stateObj => {
      const device = this.stateManager.devices.find(d => d.productId === stateObj.deviceId);
      return device.name;
    });

    if(devicesWithUndefinedState.length > 0) {
      let message = 'The state "'+itemName+'" has been created but the following devices have an undefined state:';
      message += '\n\n';
      devicesWithUndefinedState.forEach(deviceName => message += '· '+deviceName+'\n');
      message += '\n';
      message += 'Please set the mentioned devices to a defined state by using the Razer macOS menu at the top right and try again.';
      window.alert(message);
    }

    const newOptions = this.stateManager.savedStates.map(state => {
      return { value: state.name, label: state.name };
    });
    this.setState({ isLoading:false, selection: newOptions.find(o => o.value === itemName), options: newOptions, optionsWithNull: this.getOptionsWithNull(newOptions) });
  }

  handleClick() {
    ipcRenderer.send('state-settings-activate', this.state.selection.value);
  }

  renderState() {
    const stateToRender = this.stateManager.savedStates.find(s => this.state.selection != null && s.name == this.state.selection.value);
    if(!stateToRender) {
      return null;
    }
    return stateToRender.states.map(stateObj => {
      const device = this.stateManager.devices.find(device => device.productId == stateObj.deviceId);
      return this.getDeviceStateFor(device, stateObj.state);
    });
  }

  selectionChangeStart(item) {
    this.setState({ selectionStart: item });
    ipcRenderer.send('state-settings-start', item.value);
  }
  selectionChangeSuspend(item) {
    this.setState({ selectionSuspend: item });
    ipcRenderer.send('state-settings-suspend', item.value);
  }
  selectionChangeResume(item) {
    this.setState({ selectionResume: item });
    ipcRenderer.send('state-settings-resume', item.value);
  }
  selectionChangeAc(item) {
    this.setState({ selectionAc: item });
    ipcRenderer.send('state-settings-ac', item.value);
  }
  selectionChangeBattery(item) {
    this.setState({ selectionBatt: item });
    ipcRenderer.send('state-settings-battery', item.value);
  }
  selectionChangeShutdown(item) {
    this.setState({ selectionShutdown: item });
    ipcRenderer.send('state-settings-shutdown', item.value);
  }
  selectionChangeLockscreen(item) {
    this.setState({ selectionLockscreen: item });
    ipcRenderer.send('state-settings-lockscreen', item.value);
  }
  selectionChangeUnlockscreen(item) {
    this.setState({ selectionUnlockscreen: item });
    ipcRenderer.send('state-settings-unlockscreen', item.value);
  }
  selectionChangeUserDidBecomeActive(item) {
    this.setState({ selectionUserDidBecomeActive: item });
    ipcRenderer.send('state-settings-userdidbecomeactive', item.value);
  }
  selectionChangeUserDidResignActive(item) {
    this.setState({ selectionUserDidResignActive: item });
    ipcRenderer.send('state-settings-userdidresignactive', item.value);
  }

  render() {

    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        borderBottom: '1px solid grey',
        color: state.isSelected ? '#47e10c' : 'grey',
        padding: '5px 10px',
        border: '1px solid #47e10c',
        borderTop: 'none',
        backgroundColor: state.isSelected ? 'green' : '#000',
        ':last-child': {
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
        },
        ':hover': {
          backgroundColor: state.isSelected ? 'green' : '#002b17',
        }
      }),
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        border: '1px solid #47e10c',
        borderRadius: '15px',
        borderBottomLeftRadius: state.menuIsOpen ? '0' : '15px',
        borderBottomRightRadius: state.menuIsOpen ? '0' : '15px',
        color: '#47e10c',
        minHeight: 0,
        boxShadow: 'none',
        transition: 'none',
        ":hover": {
          borderColor: "inherit",
        },
      }),
      menu: (provided, state) => ({
        ...provided,
        backgroundColor: 'transparent',
        margin: 0,
        zIndex: 100,
        padding: 0,
      }),
      menuList: (provided, state) => ({
        ...provided,
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0,
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        color: '#47e10c',
        padding: '0px 8px'
      }),
      indicatorSeparator: (provided, state) => ({
        ...provided,
        backgroundColor: '#47e10c',
      }),
      singleValue: (provided, state) => ({
        ...provided,
        color: '#47e10c',
      }),
      input: (provided, state) => ({
        ...provided,
        color: '#47e10c',
      }),
    };

    return (
      <Tabs>
        <TabList>
          <Tab>States</Tab>
          <Tab>Settings</Tab>
          <Tab>Current devices state (debug)</Tab>
        </TabList>
        <TabPanel>
          <div>
            <div>
              <p>
                State manager allows you to create unique states for all your devices.
                <br />Either choose an existing state to activate or create a new one by:
                </p>
              <ol>
                <li>Set each device in the state you want it to be with the help of the menu</li>
                <li>Focus the dropdown and give your state a name, like "Party" or "Work".</li>
                <li>Press enter or click on the "Create" dropdown item</li>
              </ol>
              <p>
                States defined here can be previewed, activated and used in the "Settings" tab for system / application events.
              </p>
            </div>
            <div className={'control'}>
              <Creatable isLoading={this.state.isLoading} isClearable={true} value={this.state.selection} options={this.state.options} onCreateOption={(item) => this.handleCreate(item)} onChange={(item, action) => this.selectionChange(item, action)} styles={customStyles} />
            </div>
            <div className={'control'}>
              <button disabled={this.state.selection == null} onClick={() => this.handleClick()}>{this.state.selection == null ? 'Activate - Please select a state first' : 'Activate'}</button>
            </div>
            <div className={'state-devices'}>
              {this.renderState()}
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            <p>Select a state to be activate on application and system events</p>
          </div>
          <div className={'state-selectors'}>

            <p>This state will be activated whenever Razer macOS starts or refreshes its devices.</p>
            <div className={'state-selector'}>
              <div>On application start</div>
              <div><Select value={this.state.selectionStart} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeStart(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system goes to sleep ('suspend' event).</p>
            <div className={'state-selector'}>
              <div>On system idle/sleep</div>
              <div><Select value={this.state.selectionSuspend} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeSuspend(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system wakes up ('resume' event).</p>
            <div className={'state-selector'}>
              <div>On system wake up</div>
              <div><Select value={this.state.selectionResume} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeResume(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system is plugged in ('on-ac' event).</p>
            <div className={'state-selector'}>
              <div>On system plugged in</div>
              <div><Select value={this.state.selectionAc} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeAc(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system is on battery ('on-battery' event).</p>
            <div className={'state-selector'}>
              <div>On system on battery</div>
              <div><Select value={this.state.selectionBatt} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeBattery(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system is about to shutdown ('shutdown' event).</p>
            <div className={'state-selector'}>
              <div>On system shutdown</div>
              <div><Select value={this.state.selectionShutdown} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeShutdown(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system is about to lock the screen ('lock-screen' event).</p>
            <div className={'state-selector'}>
              <div>On system lock screen</div>
              <div><Select value={this.state.selectionLockscreen} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeLockscreen(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the system is about to unlock the screen ('unlock-screen' event).</p>
            <div className={'state-selector'}>
              <div>On system unlock screen</div>
              <div><Select value={this.state.selectionUnlockscreen} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeUnlockscreen(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the user on the system is about to become active ('user-did-become-active' event).</p>
            <div className={'state-selector'}>
              <div>On system user become active</div>
              <div><Select value={this.state.selectionUserDidBecomeActive} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeUserDidBecomeActive(item)} styles={customStyles} /></div>
            </div>

            <p>This state will be activated when the user on the system is about to resign active ('user-did-resign-active' event).</p>
            <div className={'state-selector'}>
              <div>On system user resign active</div>
              <div><Select value={this.state.selectionUserDidResignActive} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeUserDidResignActive(item)} styles={customStyles} /></div>
            </div>

          </div>
        </TabPanel>
        <TabPanel>
          <div className={'state-devices'}>
            {this.stateManager.devices.map(device => this.getDeviceStateFor(device, device.state))}
          </div>
        </TabPanel>
      </Tabs>
    );
  }
}