import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import ReactSlider from 'react-slider';

export default function MouseSensitivity({ dpi, handleClick, configuration }) {
  const [currentDpi, setCurrentDpi] = useState(dpi);

  const changeSliderValue = (value) => {
    setCurrentDpi(value);
  };

  return (
    <div className="settings">
      <div className="control">
        <ReactSlider
          step={configuration.step}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={configuration.min}
          max={configuration.max}
          value={currentDpi}
          onChange={changeSliderValue}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        ></ReactSlider>
      </div>
      <div className="control">
        <button onClick={() => handleClick(currentDpi)}>Set DPI</button>
      </div>
    </div>
  );
}
