import React from 'react';
import { SectionSettingBrightness } from '../sections/sectionsettingbrightness';
import { SectionSettingSensitivity } from '../sections/sectionsettingsensitivity';
import { SectionSettingColor } from '../sections/sectionsettingcolor';
import { SectionProductHeader } from '../sections/sectionproductheader';

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
        <SectionProductHeader deviceSelected={this.deviceSelected}/>
        <div id='settings'>
          <SectionSettingColor deviceSelected={this.deviceSelected} />
          <SectionSettingSensitivity deviceSelected={this.deviceSelected} />
          <SectionSettingBrightness deviceSelected={this.deviceSelected} />
        </div>
        </div>
    </span>
    );
  }
}