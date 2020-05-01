import React, { useState, useEffect } from 'react';
import CustomColor from './components/CustomColor'

/**
 * Root React component
 */
export default function App() {
    return (
    
    <div>
        <header id="titlebar">
          <div id="drag-region">
            <div id="window-title">
              <span>Custom color picker</span>
            </div>
          </div>
        </header>

        <CustomColor />
    </div>);

}