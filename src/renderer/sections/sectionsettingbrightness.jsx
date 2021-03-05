import React from 'react';
import Brightness from '../components/Brightness/Brightness';
import { SectionSettingBlock } from './sectionsettingblock.jsx';
import { ipcRenderer } from 'electron';

export class SectionSettingBrightness extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.brightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === 'brightness');
    this.mouseBrightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === 'mouseBrightness');
  }

  renderTitle() {
    return this.brightnessFeature ? 'Keyboard Brightness' : 'Mouse Brightness';
  }

  updateKeyboardBrightness(value) {
    this.deviceSelected.settings.customBrightness = value;
    let payload = {
      device: this.deviceSelected,
    };
    ipcRenderer.send('update-keyboard-brightness', payload);
  }

  updateMouseBrightness(type, value) {
    let payload = {
      device: this.deviceSelected,
      brightness: value
    };
    ipcRenderer.send('update-mouse-'+type+'-brightness', payload);
  }

  renderSettings() {
    if (!this.brightnessFeature && !this.mouseBrightnessFeature) {
      return null;
    }

    if (this.brightnessFeature) {
      return <Brightness
        title={"Adjust keyboard brightness"}
        currentBrightness={this.deviceSelected.settings.customBrightness}
        handleBrightnessChange={(value) => {this.updateKeyboardBrightness(value);}} />;
    }

    if (this.mouseBrightnessFeature) {
      return (<div>
        {(this.mouseBrightnessFeature.configuration == null || !this.mouseBrightnessFeature.configuration.disabledLogo) &&
        <div className={'settings-brightness'}>
          <div>Logo</div>
          <Brightness title={"Adjust mouse logo brightness"}
                    currentBrightness={this.deviceSelected.brightnessLogo}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('logo', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration == null || !this.mouseBrightnessFeature.configuration.disabledScroll) &&
        <div className={'settings-brightness'}>
          <div>Scroll Wheel</div>
        <Brightness title={"Adjust mouse scroll brightness"}
                    currentBrightness={this.deviceSelected.brightnessScroll}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('scroll', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration == null || !this.mouseBrightnessFeature.configuration.disabledLeft) &&
        <div className={'settings-brightness'}>
          <div>Left Side</div>
        <Brightness title={"Adjust mouse left brightness"}
                    currentBrightness={this.deviceSelected.brightnessLeft}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('left', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration == null || !this.mouseBrightnessFeature.configuration.disabledRight) &&
        <div className={'settings-brightness'}>
          <div>Right Side</div>
        <Brightness title={"Adjust mouse right brightness"}
                    currentBrightness={this.deviceSelected.brightnessRight}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('right', value); }} />
        </div>}
      </div>);
    }
  }
}