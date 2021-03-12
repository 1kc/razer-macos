import React from 'react';
import MouseSensitivity from '../components/MouseSensitivity';
import { SectionSettingBlock } from './sectionsettingblock';
import { FeatureHelper } from '../../main/feature/featurehelper';
import { ipcRenderer } from 'electron';

export class SectionSettingSensitivity extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.dpiFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureHelper.FEATURE_MOUSE_DPI)
  }

  renderTitle() {
    return 'DPI';
  }

  handleClick(currentDpi) {
    this.deviceSelected.settings.customSensitivity = currentDpi;
    let payload = {
      device: this.deviceSelected
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