import React from 'react';
import ReactSlider from 'react-slider';
import PropTypes from 'prop-types';

const Slider = (props) => {
    return (
        <div>
            <div className="control">
                <ReactSlider
                    step={props.step}
                    className={`${props.className}`}
                    thumbClassName={props.thumbClassName}
                    trackClassName={props.trackClassName}
                    min={props.min}
                    max={props.max}
                    value={props.value}
                    onChange={props.onChange}
                    renderThumb={props.renderThumb}
                />
                {props.children}
            </div>
        </div>
    );
};

Slider.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    step: PropTypes.number,
    thumbClassName: PropTypes.string,
    trackClassName: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
};

export default Slider;
