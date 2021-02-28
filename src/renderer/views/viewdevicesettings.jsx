import React, { useState} from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import CustomColor from '../components/CustomColor';
import CustomColor2 from '../components/CustomColor2';
import MouseSensitivity from '../components/MouseSensitivity';
import Brightness from '../components/Brightness/Brightness';

export class ViewDeviceSettings extends React.Component {

  constructor(props) {
    super(props);
    if(props.config != null) {
      this.deviceSelected = props.config.device;
    }
  }

  render() {
    if (this.deviceSelected == null) {
      return (
        <span className='no-select'>
        <div id='no-device'>Please select a device to configure</div>
      </span>
      );
    }

    return (
      <span className='no-select'>
      <div id='body'>
        <div id='product'>
          {this.deviceSelected.image != null && (
            <div className='product-image'><img src={this.deviceSelected.image} /></div>
          )}
          <div className='product-description'>{this.deviceSelected.name}</div>
        </div>
        <div id='settings'>
          <div className='settings-block'>
            <div className='settings-block-title'>Colors</div>
            <div className='settings-block-body'>
              <Tabs>
                <TabList>
                  <Tab>Primary custom color</Tab>
                  <Tab disabled={this.deviceSelected.settings.customColor2 == null}>Secondary custom color</Tab>
                </TabList>

                <TabPanel>
                  <CustomColor deviceSelected={this.deviceSelected} />
                </TabPanel>
                <TabPanel>
                  {this.deviceSelected.settings.customColor2 != null && (
                    <CustomColor2 deviceSelected={this.deviceSelected} />
                  )}
                </TabPanel>
              </Tabs>
            </div>
          </div>

          {this.deviceSelected.settings.customSensitivity != null && (
            <div className='settings-block'>
              <div className='settings-block-title'>Mouse DPI</div>
              <div className='settings-block-body'><MouseSensitivity deviceSelected={this.deviceSelected} /></div>
            </div>
          )}
          {this.deviceSelected.settings.customBrightness != null && (
            <div className='settings-block'>
              <div className='settings-block-title'>Brightness</div>
              <div className='settings-block-body'><Brightness deviceSelected={this.deviceSelected} /></div>
            </div>
          )}
        </div>
        </div>
    </span>
    );
  }
}