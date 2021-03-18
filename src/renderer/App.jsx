import React, { useState, useEffect } from 'react';
import './react-tabs.css';
import { ipcRenderer } from 'electron';
import { ViewDeviceSettings } from './views/viewdevicesettings';
import { ViewColorSettings } from './views/viewcolorpicker';
import { ViewStateSettings } from './views/viewstatesettings';

/**
 * Root React component
 */
export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'device',
      message: null
    };

    ipcRenderer.on('render-view', (event, message) => {
      const {mode} = message;
      this.setState({mode: null, message: null});
      this.setState({mode: mode, message: message});
    })
  }

  render() {
    if(this.state.mode === 'device') {
      return <ViewDeviceSettings config={this.state.message}></ViewDeviceSettings>;
    } else if(this.state.mode == 'color') {
      return <ViewColorSettings config={this.state.message}></ViewColorSettings>;
    } else if(this.state.mode == 'state') {
      return <ViewStateSettings config={this.state.message}></ViewStateSettings>;
    }
    return <div></div>;
  }


}
