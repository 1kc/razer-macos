import React, {useState} from 'react';
import {ipcRenderer} from 'electron';
import Slider from '../Slider/Slider';

export default function MouseSensitivity({currentSensitivity}) {
    const [currentDpi, setCurrentDpi] = useState(currentSensitivity);

    const handleClick = () => {
        let payload = {
            dpi: currentDpi,
        };
        ipcRenderer.send('request-set-dpi', payload);
    };

    const changeSliderValue = (value) => {
        setCurrentDpi(value);
    };

    return (
        <Slider
            title={"Set mouse sensitivity DPI"}
            step={100}
            className="horizontal-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            min={100}
            max={20000}
            value={currentDpi}
            onChange={changeSliderValue}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        >
            <div className="control">
                <button onClick={handleClick}>Set DPI</button>
            </div>
        </Slider>
    );
}
