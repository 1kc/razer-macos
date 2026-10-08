import React from 'react';
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
    this.state = { mode: null, message: null, refreshing: false, revision: 0 };
    this.renderView = (event, message) => {
      this.setState(previous => ({
        mode: message.mode,
        message,
        revision: previous.revision + 1,
      }));
    };
    this.refreshDevices = (event, refreshing) => this.setState({ refreshing });
  }

  componentDidMount() {
    ipcRenderer.on('render-view', this.renderView);
    ipcRenderer.on('device-refreshing', this.refreshDevices);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('render-view', this.renderView);
    ipcRenderer.removeListener('device-refreshing', this.refreshDevices);
  }

  render() {
    const { mode, message, refreshing, revision } = this.state;
    if (refreshing) {
      return <div role="status">Refreshing devices…</div>;
    }
    if (mode === 'device-unavailable') {
      return <div role="status">{message.message}</div>;
    }
    if (mode === 'device') {
      return <ViewDeviceSettings key={revision} config={message} />;
    }
    if (mode === 'color') {
      return <ViewColorSettings key={revision} config={message} />;
    }
    if (mode === 'state') {
      return <ViewStateSettings key={revision} config={message} />;
    }
    return <div />;
  }
}
