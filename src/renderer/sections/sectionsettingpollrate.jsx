import React, { Component } from 'react';
import Select from 'react-select';
import { SectionSettingBlock } from './sectionsettingblock';
import { ipcRenderer } from 'electron';
import { FeatureHelper } from '../../main/feature/featurehelper';

export class SectionSettingPollRate extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.pollRateFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureHelper.FEATURE_POLL_RATE);
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
        backgroundColor: 'black',
      }),
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        border: '1px solid #47e10c',
        color: '#47e10c',
      }),
      menu: (provided, state) => ({
        backgroundColor: 'black',
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        color: '#47e10c',
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