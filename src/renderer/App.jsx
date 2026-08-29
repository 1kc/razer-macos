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
      message: null,
      // Bumped on every render-view so the view below is remounted. The child
      // views read props.config in their constructor, so they only pick up a
      // new device on mount. This used to happen by accident: React 16 did not
      // batch setState outside its own event handlers, so clearing the mode and
      // then setting it produced two renders, and the second remounted the view.
      // React 18 batches those into one render, the view is never unmounted, and
      // the constructor never re-runs. A changing key makes the remount explicit
      // rather than dependent on batching behaviour.
      renderKey: 0
    };

    ipcRenderer.on('render-view', (event, message) => {
      const {mode} = message;
      this.setState(previous => ({
        mode: mode,
        message: message,
        renderKey: previous.renderKey + 1
      }));
    })
  }

  render() {
    const key = this.state.renderKey;
    if(this.state.mode === 'device') {
      return <ViewDeviceSettings key={key} config={this.state.message}></ViewDeviceSettings>;
    } else if(this.state.mode == 'color') {
      return <ViewColorSettings key={key} config={this.state.message}></ViewColorSettings>;
    } else if(this.state.mode == 'state') {
      return <ViewStateSettings key={key} config={this.state.message}></ViewStateSettings>;
    }
    return <div></div>;
  }


}
