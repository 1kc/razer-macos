import React, { useState, useEffect } from 'react';
import { HuePicker, MaterialPicker } from 'react-color';
import { ipcRenderer } from 'electron';



export default function CustomColor({ deviceSelected, currentColor, setCurrentColor }) {

  const handleChange = (newColor) => {
    setCurrentColor(newColor)
  }
  const handleChangeComplete = (newColor, event) => {
    let payload = {
        device: deviceSelected,
        color: newColor
    };
    ipcRenderer.send('request-set-custom-color', payload);
  }
  return (
      <div className="settings">
        <div className="control">
          <HuePicker color={currentColor} onChange={handleChange} onChangeComplete={handleChangeComplete}/>
        </div>
        <div className="control">
          <MaterialPicker color={currentColor} onChange={handleChange} onChangeComplete={handleChangeComplete} />
        </div>
      </div>
    
  );
}