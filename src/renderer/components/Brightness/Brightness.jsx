import React, { useState } from 'react';
import Slider from '../Slider/Slider';
import { ipcRenderer } from 'electron';

export default function Brightness({deviceSelected, brightness}) {
  const [currentBrightness, setCurrentBrightness] = useState(brightness);

  const handleClick = (value) => {
    deviceSelected.settings.customBrightness = value;
    let payload = {
      device: deviceSelected,
    };
    ipcRenderer.send('update-keyboard-brightness', payload);
  }

  const handleBrightnessChange = (value) => {
    setCurrentBrightness(value);
    handleClick(value);
  };

    return (
        <Slider
            title={"Adjust keyboard brightness"}
            step={1}
            className="horizontal-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            min={0}
            max={100}
            value={currentBrightness}
            onChange={handleBrightnessChange}
            renderThumb={(props, state) => (
                <div {...props}>{state.valueNow + '%'}</div>
            )}
        />
    );
}
