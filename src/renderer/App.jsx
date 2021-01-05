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
  const INITIAL_COLOR = {};
  const INITIAL_COLOR2 = {};
  const [deviceSelected, setDeviceSelected] = useState('Keyboard');
  const [currentColor, setCurrentColor] = useState(INITIAL_COLOR);
  const [currentColor2, setCurrentColor2] = useState(INITIAL_COLOR2);
  const [currentSensitivity, setCurrentSensitivity] = useState(3200);
  // 0-100. In debug mode, this will be set to 50 when the UI is loaded
  const [currentBrightness, setCurrentBrightness] = useState(50);

  useEffect(() => {
    ipcRenderer.on('device-selected', (event, message) => {
      if (message.currentSensitivity != null) {
        setCurrentSensitivity(message.currentSensitivity);
      }
      if (message.currentBrightness != null) {
        setCurrentBrightness(message.currentBrightness);
      }
      setDeviceSelected(message.device);
      setCurrentColor(message.currentColor);
      setCurrentColor2(message.currentColor2);
    });
  }, []);

  useEffect(() => {
    let payload = {
      brightness: currentBrightness,
    };
    ipcRenderer.send('update-keyboard-brightness', payload);
  }, [currentBrightness]);

  const handleBrightnessChange = (value) => {
    setCurrentBrightness(value);
  };

  return (
    <span className="no-select">
      <header id="titlebar">
        <div id="drag-region">
          <div id="window-title">
            <span>{deviceSelected} settings</span>
          </div>
        </div>
      </header>
      <Tabs>
        <TabList>
          <Tab>Primary custom color</Tab>
          <Tab disabled={deviceSelected !== "Keyboard"}>Secondary custom color</Tab>
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
      {deviceSelected === 'Mouse' && (
        <MouseSensitivity
          currentSensitivity={currentSensitivity}
        ></MouseSensitivity>
      )}
      {deviceSelected === 'Keyboard' && (
        <Brightness
          brightness={currentBrightness}
          onBrightnessChange={handleBrightnessChange}
        />)}
    </span>
  );
}
