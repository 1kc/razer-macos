import React, { useState, useEffect } from 'react';
import CustomColor from './components/CustomColor'
import { ipcRenderer } from 'electron';

/**
 * Root React component
 */
export default function App() {
    const INITIAL_COLOR = {}

    const [deviceSelected, setDeviceSelected] = useState('Keyboard');
    const [currentColor, setCurrentColor] = useState(INITIAL_COLOR);

    useEffect( () => {
        ipcRenderer.on('device-selected', (event, message) => { 
          setDeviceSelected(message.device);
          setCurrentColor(message.currentColor);
        });
                
    }, []);

    return (
    
    <div>
        <header id="titlebar">
          <div id="drag-region">
            <div id="window-title">
              <span>{deviceSelected} custom color picker</span>
            </div>
          </div>
        </header>

        <CustomColor deviceSelected={deviceSelected} currentColor={currentColor} setCurrentColor={setCurrentColor}/>
    </div>);

}