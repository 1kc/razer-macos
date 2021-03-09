import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import ReactSlider from 'react-slider';

export default function MouseSensitivity({ deviceSelected }) {
  const [currentDpi, setCurrentDpi] = useState(deviceSelected.settings.customSensitivity);

  const handleClick = () => {
    deviceSelected.settings.customSensitivity = currentDpi;
    let payload = {
      device: deviceSelected
    };
    ipcRenderer.send('request-set-dpi', payload);
  };

  const changeSliderValue = (value) => {
    setCurrentDpi(value);
  };

  return (
    <div className="settings">
      <div className="control">
        <ReactSlider
          step={100}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={100}
          max={20000}
          value={currentDpi}
          onChange={changeSliderValue}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        ></ReactSlider>
      </div>
      <div className="control">
        <button onClick={handleClick}>Set DPI</button>
      </div>
    </div>
  );
}
