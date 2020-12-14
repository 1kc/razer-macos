import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import ReactSlider from 'react-slider';

export default function Brightness({ currentBrightness }) {
  const [brightness, setBrightness] = useState(currentBrightness);

  useEffect(() => {
    let payload = {
      brightness,
    };
    ipcRenderer.send('update-keyboard-brightness', payload);
  }, [brightness]);

  const changeSliderValue = (value) => {
    setBrightness(value);
  };

  return (
    <div className="settings">
      <h4>Adjust keyboard brightness</h4>
      <div className="control">
        <ReactSlider
          step={1}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={100}
          value={brightness}
          onChange={changeSliderValue}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        ></ReactSlider>
      </div>
    </div>
  );
}
