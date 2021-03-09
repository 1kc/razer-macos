import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { ipcRenderer } from 'electron';

export class ViewColorSettings extends React.Component {

  constructor(props) {
    super(props);
    this.index = props.config.index;
    this.state = {
      color: {
        hex: this.rgbToHex(props.config.color),
        rgb: props.config.color,
      }
    }
  }

  componentToHex(c) {
    if (typeof c === 'undefined') {
      return '00';
    }
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  rgbToHex({ r, g, b }) {
    return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  handleChange(newColor) {
    this.setState({ color: newColor});
  }

  handleClick() {
    let payload = {
      index: this.index,
      color: this.state.color,
    };
    ipcRenderer.send('request-cycle-color', payload);
  }

  render() {
    const styles = {
      'default': {
        picker: { background: '#202124', boxShadow: 'none' }, body: {
          padding: '12px 0 0',
        },
      },
    };
    return (
      <div>
        <div className='control'>
          <ChromePicker color={this.state.color} onChange={(c) => this.handleChange(c)} width='100%' disableAlpha={true} styles={styles}
                        defaultView={'rgb'} />
        </div>
        <div className='control'>
          <button onClick={() => this.handleClick()}>Save custom color</button>
        </div>
      </div>
    );
  }
}