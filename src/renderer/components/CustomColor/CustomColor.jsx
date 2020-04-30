import React, { useState } from 'react';
import { HuePicker } from 'react-color';
import { ipcRenderer } from 'electron'

const ITEMS = [
    {label: "Static", value: "static"},
    {label: "Reactive", value: "reactive"},
    {label: "Starlight", value: "starlight"},
  ]

export default function CustomColor() {
  // UI state
  const [color, setColor] = useState('#fff');

  const [value, setValue] = React.useState("static");

  const handleChange = (newColor) => {
    setColor(newColor)
  }
  const handleChangeComplete = (newColor, event) => {
    let payload = {
        mode: value,
        color: newColor
    };
    ipcRenderer.send('request-set-custom-color', payload);
  }
  return (
      <div className="settings">
          <select
            value={value}
            onChange={e => setValue(e.currentTarget.value)}
          >
          {ITEMS.map(item => (
              <option
              key={item.value}
              value={item.value}
              >
              {item.label}
              </option>
          ))}
          </select>
          <HuePicker color={color} onChange={handleChange} onChangeComplete={handleChangeComplete}/>
      </div>
    
  );
}