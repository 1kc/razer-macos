import React, { useState } from 'react';
import { ChromePicker, GithubPicker } from 'react-color';
import { ipcRenderer } from 'electron';
import { FeatureIdentifier } from '../../../main/feature/featureidentifier';


export default function CustomColor({ deviceSelected }) {

  const componentToHex = (c) => {
    if (typeof c === 'undefined') {
      return '00';
    }
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };

  const rgbToHex = ({ r, g, b }) => {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  const [currentColor, setCurrentColor] = useState({
    hex: rgbToHex(deviceSelected.settings.customColor1.rgb),
    rgb: deviceSelected.settings.customColor1.rgb,
  });

  const handleChange = (newColor) => {
    setCurrentColor(newColor);
  };

  const handleClick = () => {
    deviceSelected.settings.customColor1 = currentColor;
    let payload = {
      device: deviceSelected,
    };
    ipcRenderer.send('request-set-custom-color', payload);
  };
  const styles = { 'default': { picker: { background: '#202124', boxShadow: 'none'}, body: {
        padding: '12px 0 0'
      } }};
  const stylesGithub = { 'default': { card: { background: '#000'}, triangle: {borderBottomColor: '#000'}}};

  const hasAllColors = (staticFeature) => {
    return staticFeature.configuration.enabledRed
      && staticFeature.configuration.enabledGreen
      && staticFeature.configuration.enabledBlue;
  }

  const staticFeature = deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.STATIC);
  const allColors = hasAllColors(staticFeature);
  let colors = [];
  if(!allColors) {
    const allNoneValues = [0];
    const allColorValues = [0,25,50,75,100,125,150,175,200,225,255];
    const allReds = staticFeature.configuration.enabledRed ? allColorValues : allNoneValues;
    const allGreens = staticFeature.configuration.enabledGreen ?  allColorValues : allNoneValues;
    const allBlues = staticFeature.configuration.enabledBlue ? allColorValues : allNoneValues;
    allReds.forEach(r => {
      allGreens.forEach(g => {
        allBlues.forEach(b => {
          const hex = rgbToHex({r, g, b});
          const value = parseInt(hex.replace('#', '0x'));
          colors.push({ value, hex })
        })
      })
    });
    colors.sort((a,b) => {
      return a.value - b.value;
    });
    colors = colors.map(color => color.hex);
  }

  return (
    <div>
      <div className='control'>
        {allColors && (
          <ChromePicker color={currentColor} onChange={handleChange} width='100%' disableAlpha={true} styles={styles} defaultView={'rgb'}/>
        )}
        {!allColors && (
          <GithubPicker color={currentColor} onChange={handleChange} width='auto' colors={colors} styles={stylesGithub}/>
        )}
      </div>
      <div className='control'>
        <button onClick={handleClick}>Save custom color</button>
      </div>
    </div>
  );
}
