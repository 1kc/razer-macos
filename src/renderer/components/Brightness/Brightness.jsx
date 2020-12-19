import React from 'react';
import ReactSlider from 'react-slider';

export default function Brightness({ brightness, onBrightnessChange }) {
  return (
    <div className="settings">
      <p className="ui-center-text">Adjust keyboard brightness</p>
      <div className="control">
        <ReactSlider
          step={1}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={100}
          value={brightness}
          onChange={onBrightnessChange}
          renderThumb={(props, state) => (
            <div {...props}>{state.valueNow + '%'}</div>
          )}
        ></ReactSlider>
      </div>
    </div>
  );
}
