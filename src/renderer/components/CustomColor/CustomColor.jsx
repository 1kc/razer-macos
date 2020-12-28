import React from 'react';
import { HuePicker, MaterialPicker } from 'react-color';
import { ipcRenderer } from 'electron';

export default function CustomColor({
  deviceSelected,
  currentColor,
  setCurrentColor,
}) {
  const handleChange = (newColor) => {
    setCurrentColor(newColor);
  };

  const handleClick = () => {
    let payload = {
      device: deviceSelected,
      color: currentColor,
    };
    ipcRenderer.send('request-set-custom-color', payload);
  };

  return (
    <div className="settings">
      <p className="ui-center-text">Custom color selection</p>
      <div className="control">
        <HuePicker color={currentColor} onChange={handleChange} />
      </div>
      <div className="control">
        <MaterialPicker color={currentColor} onChange={handleChange} />
      </div>
      <div className="control">
        <button onClick={handleClick}>Save custom color</button>
      </div>
    </div>
  );
}
