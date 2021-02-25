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

  const componentToHex = (c) => {
    if(typeof c === 'undefined') {
      return '00';
    }
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };

  const rgbToHex = ({ r, g, b }) => {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  const INITIAL_COLOR = {};
  const INITIAL_COLOR2 = {};
  const NULL_DEVICE = { settings: {} }
  const [deviceSelected, setDeviceSelected] = useState(NULL_DEVICE);
  const [currentColor, setCurrentColor] = useState(INITIAL_COLOR);
  const [currentColor2, setCurrentColor2] = useState(INITIAL_COLOR2);
  const [currentSensitivity, setCurrentSensitivity] = useState(3200);
  // 0-100. In debug mode, this will be set to 50 when the UI is loaded
  const [currentBrightness, setCurrentBrightness] = useState(50);

  useEffect(() => {
    ipcRenderer.on('device-selected', (event, message) => {
      setDeviceSelected(message.device);
      setCurrentColor({
        hex: rgbToHex(message.device.settings.customColor1.rgb),
        rgb: message.device.settings.customColor1.rgb,
      });

      if (message.device.settings.customColor2 != null) {
        setCurrentColor2({
          hex: rgbToHex(message.device.settings.customColor2.rgb),
          rgb: message.device.settings.customColor2.rgb,
        });
      }

      if (message.device.settings.customSensitivity != null) {
        setCurrentSensitivity(message.device.settings.customSensitivity);
      }
      if (message.device.settings.customBrightness != null) {
        setCurrentBrightness(message.device.settings.customBrightness);
      }
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
          <CustomColor
            deviceSelected={deviceSelected}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
          />
        </TabPanel>
        <TabPanel>
          <CustomColor2
            deviceSelected={deviceSelected}
            currentColor2={currentColor2}
            setCurrentColor2={setCurrentColor2}
          />
        </TabPanel>
      </Tabs>
      {deviceSelected.settings.customSensitivity != null && (
        <MouseSensitivity
          deviceSelected={deviceSelected}
          currentSensitivity={currentSensitivity}
        ></MouseSensitivity>
      )}
      {deviceSelected.settings.customBrightness != null && (
        <Brightness
          deviceSelected={deviceSelected}
          brightness={currentBrightness}
        />)}
    </span>
  );
}
