import React from 'react';
import Slider from '../Slider/Slider';

export default function Brightness({brightness, onBrightnessChange}) {
    return (
        <Slider
            title={"Adjust keyboard brightness"}
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
        />
    );
}
