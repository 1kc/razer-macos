import React from 'react';
import MouseSensitivity from '../components/MouseSensitivity';
import { SectionSettingBlock } from './sectionsettingblock';

export class SectionSettingSensitivity extends SectionSettingBlock {

  constructor(props) {
    super(props);
  }

  renderTitle() {
    return 'DPI';
  }

  renderSettings() {
    if(this.deviceSelected.settings.customSensitivity == null) {
      return null;
    }
    return <MouseSensitivity deviceSelected={this.deviceSelected} />;
  }
}