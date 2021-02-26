import React, { useState } from 'react';
import { ChromePicker, HuePicker, MaterialPicker } from 'react-color';
import { ipcRenderer } from 'electron';

export default function CustomColor2({ deviceSelected }) {

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
    hex: rgbToHex(deviceSelected.settings.customColor2.rgb),
    rgb: deviceSelected.settings.customColor2.rgb,
  });
  const handleChange = (newColor) => {
    setCurrentColor(newColor);
  };

  const handleClick = () => {
    deviceSelected.settings.customColor2 = currentColor;
    let payload = {
      device: deviceSelected,
    };
    ipcRenderer.send('request-set-custom-color2', payload);
  };
  const styles = { 'default': { picker: { background: '#202124', boxShadow: 'none'} }};
  return (
    <div>
      <p>Secondary custom color selection (Starlight Dual Mode only)</p>
      <div className='control'>
        <ChromePicker color={currentColor} onChange={handleChange} width='100%' disableAlpha={true} styles={styles} defaultView={'rgb'}/>
      </div>
      <div className='control'>
        <button onClick={handleClick}>Save custom color</button>
      </div>
    </div>
  );
}
