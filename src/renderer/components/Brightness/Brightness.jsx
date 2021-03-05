import React, { useState } from 'react';
import Slider from '../Slider/Slider';

export default function Brightness({ title, currentBrightness, handleBrightnessChange }) {

  const [brightness, setBrightness] = useState(currentBrightness);

  const onChange = (value) => {
    setBrightness(value);
    handleBrightnessChange(value);
  };
  return (
    <Slider
      title={title}
      step={1}
      className='horizontal-slider'
      thumbClassName='slider-thumb'
      trackClassName='slider-track'
      min={0}
      max={100}
      value={brightness}
      onChange={onChange}
      renderThumb={(props, state) => (
        <div {...props}>{state.valueNow + '%'}</div>
      )}
    />
  );
}
