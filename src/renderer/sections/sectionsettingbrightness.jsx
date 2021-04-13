import React from 'react';
import Brightness from '../components/Brightness/Brightness';
import { SectionSettingBlock } from './sectionsettingblock.jsx';
import { ipcRenderer } from 'electron';
import { FeatureIdentifier } from '../../main/feature/featureidentifier';

export class SectionSettingBrightness extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.brightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.BRIGHTNESS);
    this.mouseBrightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.MOUSE_BRIGHTNESS);
    this.mouseMatBrightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.MOUSE_MAT_BRIGHTNESS);
  }

  renderTitle() {
    if (this.brightnessFeature) {
      return 'Keyboard Brightness';
    }

    if (this.mouseBrightnessFeature) {
      return 'Mouse Brightness';
    }

    if (this.mouseMatBrightnessFeature) {
      return 'MouseMat Brightness';
    }
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

  updateMouseMatBrightness(value) {
    this.deviceSelected.settings.customBrightness = value;
    let payload = {
      device: this.deviceSelected,
    };
    ipcRenderer.send('update-mousemat-brightness', payload);
  }

  renderSettings() {
    if (!this.brightnessFeature && !this.mouseBrightnessFeature && !this.mouseMatBrightnessFeature) {
      return null;
    }

    if (this.mouseMatBrightnessFeature) {
      return <Brightness
        title={"Adjust Mousemat brightness"}
        currentBrightness={this.deviceSelected.settings.customBrightness}
        handleBrightnessChange={(value) => {this.updateMouseMatBrightness(value);}} />;
    }

    if (this.brightnessFeature) {
      return <Brightness
        title={"Adjust keyboard brightness"}
        currentBrightness={this.deviceSelected.settings.customBrightness}
        handleBrightnessChange={(value) => {this.updateKeyboardBrightness(value);}} />;
    }

    if (this.mouseBrightnessFeature) {
      return (<div>
        {(this.mouseBrightnessFeature.configuration.enabledLogo) &&
        <div className={'settings-brightness'}>
          <div>Logo</div>
          <Brightness title={"Adjust mouse logo brightness"}
                    currentBrightness={this.deviceSelected.brightnessLogo}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('logo', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration.enabledScroll) &&
        <div className={'settings-brightness'}>
          <div>Scroll Wheel</div>
        <Brightness title={"Adjust mouse scroll brightness"}
                    currentBrightness={this.deviceSelected.brightnessScroll}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('scroll', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration.enabledLeft) &&
        <div className={'settings-brightness'}>
          <div>Left Side</div>
        <Brightness title={"Adjust mouse left brightness"}
                    currentBrightness={this.deviceSelected.brightnessLeft}
                    handleBrightnessChange={(value) => {this.updateMouseBrightness('left', value); }} />
        </div>}
        {(this.mouseBrightnessFeature.configuration.enabledRight) &&
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