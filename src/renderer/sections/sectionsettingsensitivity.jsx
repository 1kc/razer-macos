import React from 'react';
import MouseSensitivity from '../components/MouseSensitivity';
import { SectionSettingBlock } from './sectionsettingblock';
import { ipcRenderer } from 'electron';
import { FeatureIdentifier } from '../../main/feature/featureidentifier';

export class SectionSettingSensitivity extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.dpiFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.MOUSE_DPI)
  }

  renderTitle() {
    return 'DPI';
  }

  handleClick(currentDpi) {
    let payload = {
      device: this.deviceSelected,
      dpi: currentDpi
    };
    ipcRenderer.send('request-set-dpi', payload);
  };

  renderSettings() {
    if(this.dpiFeature == null) {
      return null;
    }
    return <MouseSensitivity dpi={this.deviceSelected.dpi} configuration={this.dpiFeature.configuration} handleClick={(dpi) => this.handleClick(dpi)} />;
  }
}