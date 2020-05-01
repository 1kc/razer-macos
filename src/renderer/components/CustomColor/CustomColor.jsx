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
  const [color, setColor] = useState('#00ff00');

  const [value, setValue] = React.useState("");

  const handleChange = (newColor) => {
    if (value === "") return;
    setColor(newColor)
  }
  const handleChangeComplete = (newColor, event) => {
    if (value === "") return;
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
          <option value="" disabled>Select effect</option>
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