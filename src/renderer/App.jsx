import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './react-tabs.css';
import CustomColor from './components/CustomColor';
import CustomColor2 from './components/CustomColor2';
import { ipcRenderer } from 'electron';
import MouseSensitivity from './components/MouseSensitivity';
import Brightness from './components/Brightness/Brightness';

/**
 * Root React component
 */
export default function App() {
  const NULLDEVICE = {
    settings: {
      customColor1: {
        rgb:{ r: 255, g: 255, b: 0 }
      },
    }
  }
  const [deviceSelected, setDeviceSelected] = useState(NULLDEVICE);

  useEffect(() => {
    ipcRenderer.on('device-selected', (event, message) => {
      //force refresh by setting to NULL device first
      setDeviceSelected(NULLDEVICE);
      setDeviceSelected(message.device);
    });
  }, []);

  return (
    <span className='no-select'>
      <header id='titlebar'>
        <div id='drag-region'>
          <div id='window-title'>
            <span>{deviceSelected.name} settings</span>
          </div>
        </div>
      </header>
      <Tabs>
        <TabList>
          <Tab>Primary custom color</Tab>
          <Tab disabled={deviceSelected.settings.customColor2 == null}>Secondary custom color</Tab>
        </TabList>

        <TabPanel>
          <CustomColor deviceSelected={deviceSelected} />
        </TabPanel>
        <TabPanel>
          {deviceSelected.settings.customColor2 != null && (
            <CustomColor2 deviceSelected={deviceSelected} />
          )}
        </TabPanel>
      </Tabs>
      {deviceSelected.settings.customSensitivity != null && (
        <MouseSensitivity deviceSelected={deviceSelected} />
      )}
      {deviceSelected.settings.customBrightness != null && (
        <Brightness deviceSelected={deviceSelected} />)}
    </span>
  );
}
