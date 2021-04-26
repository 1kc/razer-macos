import React from 'react';
import Brightness from '../components/Brightness/Brightness';
import { SectionSettingBlock } from './sectionsettingblock.jsx';
import { ipcRenderer } from 'electron';
import { FeatureIdentifier } from '../../main/feature/featureidentifier';

export class SectionSettingBrightness extends SectionSettingBlock {

  constructor(props) {
    super(props);
    this.brightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.BRIGHTNESS);
    this.mouseBrightnessFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.MOUSE_BRIGHTNESS);}

  renderTitle() {

    if (this.brightnessFeature) {
      if (this.deviceSelected.mainType === "mousemat") {
        return 'MouseMat Brightness';
      } else {
        return 'Keyboard Brightness';
      }
    }

    if (this.mouseBrightnessFeature) {
      return 'Mouse Brightness';
    }
  }

  updateBrightness(value) {
    let payload = {
      device: this.deviceSelected,
      brightness: value
    };
    ipcRenderer.send('update-brightness', payload);
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
        title={`Adjust ${this.deviceSelected.mainType} brightness`}
        currentBrightness={this.deviceSelected.brightness}
        handleBrightnessChange={(value) => {
          this.updateBrightness(value);
        }} />;
    }

    if (this.mouseBrightnessFeature) {
      return (<div>
        {(this.mouseBrightnessFeature.configuration.enabledMatrix) &&
        <div className={'settings-brightness'}>
          <div>All</div>
          <Brightness title={"Adjust mouse logo brightness"}
                      currentBrightness={this.deviceSelected.brightnessLogo}
                      handleBrightnessChange={(value) => {this.updateMouseBrightness('logo', value); }} />
        </div>}
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