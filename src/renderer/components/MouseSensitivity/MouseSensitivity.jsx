import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import ReactSlider from 'react-slider';

export default function MouseSensitivity({ dpi, handleClick, configuration }) {
  const [currentDpi, setCurrentDpi] = useState(dpi);

  const changeSliderValue = (value) => {
    setCurrentDpi(value);
  };

  let step = 100;
  let min = 100;
  let max = 20000;

  if(configuration != null) {
    if(configuration.step != null) {
      step = configuration.step;
    }
    if(configuration.min != null) {
      min = configuration.min;
    }
    if(configuration.max != null) {
      max = configuration.max;
    }
  }

  return (
    <div className="settings">
      <div className="control">
        <ReactSlider
          step={step}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={min}
          max={max}
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
