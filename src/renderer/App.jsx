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
  const [deviceSelected, setDeviceSelected] = useState(null);

  useEffect(() => {
    ipcRenderer.on('device-selected', (event, message) => {
      //force refresh by setting to NULL device first
      setDeviceSelected(null);
      setDeviceSelected(message.device);
    });
  }, []);

  if (deviceSelected == null) {
    return (
      <span className='no-select'>
        <div id='no-device'>Please select a device to configure</div>
      </span>
    );
  }

  return (
    <span className='no-select'>
      <div id='body'>
        <div id='product'>
          <div className='product-image'><img src={deviceSelected.img} /></div>
          <div className='product-description'>{deviceSelected.name}</div>
        </div>
        <div id='settings'>
          <div className='settings-block'>
            <div className='settings-block-title'>Colors</div>
            <div className='settings-block-body'>
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
            </div>
          </div>

          {deviceSelected.settings.customSensitivity != null && (
            <div className='settings-block'>
              <div className='settings-block-title'>Mouse DPI</div>
              <div className='settings-block-body'><MouseSensitivity deviceSelected={deviceSelected} /></div>
            </div>
          )}
          {deviceSelected.settings.customBrightness != null && (
            <div className='settings-block'>
              <div className='settings-block-title'>Brightness</div>
              <div className='settings-block-body'><Brightness deviceSelected={deviceSelected} /></div>
            </div>

            )}
        </div>
        </div>
    </span>
  );
}
