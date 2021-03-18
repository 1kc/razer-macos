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

    this.state = {
      selection: null,
      options: options,
      isLoading: false,

      optionsWithNull: optionsWithNull,
      selectionStart: optionsWithNull.find(o => o.value === this.stateManager.stateOnRefresh),
      selectionSleep: optionsWithNull.find(o => o.value === this.stateManager.stateOnSleep),
      selectionWake: optionsWithNull.find(o => o.value === this.stateManager.stateOnWake),
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

  selectionChangeSleep(item) {
    this.setState({ selectionSleep: item });
    ipcRenderer.send('state-settings-sleep', item.value);
  }

  selectionChangeWake(item) {
    this.setState({ selectionWake: item });
    ipcRenderer.send('state-settings-wake', item.value);
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
            <p>This state will be activated when the system goes to sleep (suspend event).</p>
            <div className={'state-selector'}>
              <div>On system idle/sleep</div>
              <div><Select value={this.state.selectionSleep} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeSleep(item)} styles={customStyles} /></div>
            </div>
            <p>This state will be activated when the system wakes up (resume event).</p>
            <div className={'state-selector'}>
              <div>On system wake up</div>
              <div><Select value={this.state.selectionWake} options={this.state.optionsWithNull} onChange={(item) => this.selectionChangeWake(item)} styles={customStyles} /></div>
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