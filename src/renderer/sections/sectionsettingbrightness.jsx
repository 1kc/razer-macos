import React from 'react';
import Brightness from '../components/Brightness/Brightness';
import { SectionSettingBlock } from './sectionsettingblock.jsx';

export class SectionSettingBrightness extends SectionSettingBlock {

  constructor(props) {
    super(props);
  }

  renderTitle() {
    return 'Brightness';
  }

  renderSettings() {
    if(this.deviceSelected.settings.customBrightness == null) {
      return null;
    }
    return  <Brightness deviceSelected={this.deviceSelected} />;
  }
}