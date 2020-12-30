import React from 'react';
import { HuePicker, MaterialPicker } from 'react-color';
import { ipcRenderer } from 'electron';

export default function CustomColor2({
  deviceSelected,
  currentColor2,
  setCurrentColor2,
}) {
  const handleChange2 = (newColor2) => {
    setCurrentColor2(newColor2);
  };

  const handleClick2 = () => {
    let payload = {
      device: deviceSelected,
      color: currentColor2,
    };
    ipcRenderer.send('request-set-custom-color2', payload);
  };

  return (
    <div className="settings">
      <p className="ui-center-text">Secondary custom color selection</p>
      <p className="ui-center-text">(Starlight Dual Mode only)</p>
      <div className="control">
        <HuePicker color={currentColor2} onChange={handleChange2} />
      </div>
      <div className="control">
        <MaterialPicker color={currentColor2} onChange={handleChange2} />
      </div>
      <div className="control">
        <button onClick={handleClick2}>Save secondary custom color</button>
      </div>
    </div>
  );
}
