import React, { Component } from 'react';
import Select from 'react-select';
import { SectionSettingBlock } from './sectionsettingblock';
import { ipcRenderer } from 'electron';
import { FeatureIdentifier } from '../../main/feature/featureidentifier';

export class SectionSettingPollRate extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.pollRateFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.POLL_RATE);
    this.state = {
      pollRate: { value: this.deviceSelected.pollRate, label: this.deviceSelected.pollRate + 'Hz' },
    };
  }

  renderTitle() {
    return 'Polling rate (Hz)';
  }

  selectionChange(item) {
    this.setState({ pollRate: item });
  }

  handleClick() {
    let payload = {
      device: this.deviceSelected,
      pollRate: this.state.pollRate.value,
    };
    ipcRenderer.send('update-mouse-pollrate', payload);
  }

  renderSettings() {
    if (this.pollRateFeature == null) {
      return null;
    }

    const options = this.pollRateFeature.configuration.pollRates.map(rate => {
      return { value: rate, label: rate + 'Hz' };
    });

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
    };

    return <div style={{ paddingTop: '10px' }}>
      <div className={'control'}>
        <Select value={this.state.pollRate} options={options} onChange={(item) => this.selectionChange(item)}
                styles={customStyles} />
      </div>
      <div className={'control'}>
        <button onClick={() => this.handleClick()}>Save polling rate</button>
      </div>
    </div>;
  }
}