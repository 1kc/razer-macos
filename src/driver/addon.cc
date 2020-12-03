#include <napi.h>
#include <iostream>
#include <iomanip> 

extern "C" {
  #include "razerdevice.h"
  #include "razerkbd_driver.h"
  #include "razermouse_driver.h"
  #include "razermousedock_driver.h"
  #include "razermousemat_driver.h"
  #include "razerheadphone_driver.h"
}


IOUSBDeviceInterface **kbdDev;
IOUSBDeviceInterface **mouseDev;
IOUSBDeviceInterface **mouseDockDev;
IOUSBDeviceInterface **mouseMatDev;
IOUSBDeviceInterface **headphoneDev;

/**
* Get the Razer Keyboard USB device interface and device name, 
* return JS Null if non found
*/
Napi::Value GetKeyboardDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  kbdDev = getRazerUSBDeviceInterface(TYPE_KEYBOARD);
  if (kbdDev == NULL) {
    return env.Null();
  }

  char buf[256] = {0};
  razer_attr_read_device_type(kbdDev, buf);
  return Napi::String::New(env, buf);
}

void CloseKeyboardDevice(const Napi::CallbackInfo& info) {
  if (kbdDev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(kbdDev);

}

void KbdSetModeNone(const Napi::CallbackInfo& info) {
  if (kbdDev == NULL) {
    return;
  }
  razer_attr_write_mode_none(kbdDev, "1", 1);
}

void KbdSetModeSpectrum(const Napi::CallbackInfo& info) {
  if (kbdDev == NULL) {
    return;
  }
  razer_attr_write_mode_spectrum(kbdDev, "1", 1);
}

void KbdSetModeWave(const Napi::CallbackInfo& info) {
  if (kbdDev == NULL) {
    return;
  }
  if (std::strncmp(info[0].ToString().Utf8Value().c_str(), "left", 4) == 0) {
    razer_attr_write_mode_wave(kbdDev, "1", 0);
  } else {
    razer_attr_write_mode_wave(kbdDev, "2", 0);
  }
}

void KbdSetModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (kbdDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Static only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_mode_static(kbdDev, buf, 3);
}

void KbdSetModeStaticNoStore(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (kbdDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Static only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_mode_static_no_store(kbdDev, buf, 3);
}

void KbdSetModeReactive(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (kbdDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();
  // TODO: allow different arg length types
  if (argsArr.ElementLength() != 4) {
    Napi::TypeError::New(env, "Reactive only accepts Speed, RGB (4byte)")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_mode_reactive(kbdDev, buf, 4);
}

void KbdSetModeBreathe(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (kbdDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 1) {
    Napi::TypeError::New(env, "Breathing only accepts '1' (1byte). RGB (3byte). RGB, RGB (6byte)")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_mode_breath(kbdDev, buf, 1);
}

void KbdSetModeStarlight(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (kbdDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 4) {
    Napi::TypeError::New(env, "Starlight only accepts Speed (1byte). Speed, RGB (4byte). Speed, RGB, RGB (7byte)")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_mode_starlight(kbdDev, buf, 4);
}

/**
* Get the Razer Mouse USB device interface and device name, 
* return JS Null if non found
*/
Napi::Value GetMouseDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  mouseDev = getRazerUSBDeviceInterface(TYPE_MOUSE);
  if (mouseDev == NULL) {
    return env.Null();
  }

  char buf[256] = {0};
  razer_mouse_attr_read_device_type(mouseDev, buf);
  return Napi::String::New(env, buf);
}

Napi::Number GetMousebatteryLevel(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == nullptr) {
    return Napi::Number::New(env, -1);
  }

  char buf[4] = {0};

  razer_attr_read_get_battery(mouseDev, buf);
  double bufferValue = atof(buf);

  if (bufferValue <= 0)
  {
    return Napi::Number::New(env, -1);
  }
  double batteryLevel = (bufferValue * 100.0) / 255.0;
  return Napi::Number::New(env, static_cast<int>(batteryLevel));
}

Napi::Boolean GetIsMouseCharging(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == nullptr) {
    return Napi::Boolean::New(env, false);
  }

  char buf[2] = {0};
  razer_attr_read_is_charging(mouseDev, buf);
  int charging = atoi(buf);

  return Napi::Boolean::New(env, static_cast<bool>(charging));
}


void CloseMouseDevice(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(mouseDev);

}


void MouseSetLogoLEDEffect(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  const char* effect =  info[0].ToString().Utf8Value().c_str();

  if (std::strncmp(effect, "static", 6) == 0) {
    razer_attr_write_logo_led_effect(mouseDev, "0", 1);
  } else if (std::strncmp(effect, "blinking", 8) == 0) {
    razer_attr_write_logo_led_effect(mouseDev, "1", 1);
  } else if (std::strncmp(effect, "pulsate", 7) == 0) {
    razer_attr_write_logo_led_effect(mouseDev, "2", 1);
  } else if (std::strncmp(effect, "scroll", 6) == 0) {
    razer_attr_write_logo_led_effect(mouseDev, "4", 1);
  }

}

void MouseSetLogoLEDRGB(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_logo_led_rgb(mouseDev, buf, 3);
}

void MouseSetLogoModeWave(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }

  if (std::strncmp(info[0].ToString().Utf8Value().c_str(), "left", 4) == 0) {
    razer_attr_write_logo_mode_wave(mouseDev, "1", 0);
    razer_attr_write_scroll_mode_wave(mouseDev, "1", 0);
    razer_attr_write_left_mode_wave(mouseDev, "1", 0);
    razer_attr_write_right_mode_wave(mouseDev, "1", 0);
  } else {
    razer_attr_write_logo_mode_wave(mouseDev, "2", 0);
    razer_attr_write_scroll_mode_wave(mouseDev, "2", 0);
    razer_attr_write_left_mode_wave(mouseDev, "2", 0);
    razer_attr_write_right_mode_wave(mouseDev, "2", 0);
  }
}

void MouseSetLogoModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_logo_mode_static(mouseDev, buf, 3);
  razer_attr_write_scroll_mode_static(mouseDev, buf, 3);
  razer_attr_write_left_mode_static(mouseDev, buf, 3);
  razer_attr_write_right_mode_static(mouseDev, buf, 3);
}

void MouseSetLogoModeStaticNoStore(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_logo_mode_static_no_store(mouseDev, buf, 3);
  razer_attr_write_scroll_mode_static_no_store(mouseDev, buf, 3);
  razer_attr_write_left_mode_static_no_store(mouseDev, buf, 3);
  razer_attr_write_right_mode_static_no_store(mouseDev, buf, 3);
}

void MouseSetLogoModeSpectrum(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  razer_attr_write_logo_mode_spectrum(mouseDev, "1", 1);
  razer_attr_write_scroll_mode_spectrum(mouseDev, "1", 1);
  razer_attr_write_left_mode_spectrum(mouseDev, "1", 1);
  razer_attr_write_right_mode_spectrum(mouseDev, "1", 1);
}

void MouseSetLogoModeReactive(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 4) {
    Napi::TypeError::New(env, "Reactive only accepts Speed, RGB (4byte)")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_attr_write_logo_mode_reactive(mouseDev, buf, 4);
  razer_attr_write_scroll_mode_reactive(mouseDev, buf, 4);
  razer_attr_write_left_mode_reactive(mouseDev, buf, 4);
  razer_attr_write_right_mode_reactive(mouseDev, buf, 4);
}

void MouseSetLogoModeBreathe(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  razer_attr_write_logo_mode_breath(mouseDev, "1", 1);
  razer_attr_write_scroll_mode_breath(mouseDev, "1", 1);
  razer_attr_write_left_mode_breath(mouseDev, "1", 1);
  razer_attr_write_right_mode_breath(mouseDev, "1", 1);
}

void MouseSetLogoModeNone(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  razer_attr_write_logo_mode_none(mouseDev, "1", 1);
  razer_attr_write_scroll_mode_none(mouseDev, "1", 1);
  razer_attr_write_left_mode_none(mouseDev, "1", 1);
  razer_attr_write_right_mode_none(mouseDev, "1", 1);
}

Napi::Number MouseGetDpi(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // Return 0 if no device
    if (mouseDev == NULL) {
      return Napi::Number::New(env, 0);;
    }

    ushort dpi = razer_attr_read_dpi(mouseDev);

    return Napi::Number::New(env, dpi);
}

void MouseSetDpi(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  Napi::Number dpi_number = info[0].ToNumber();;
  ushort dpi = dpi_number.Int32Value();

  razer_attr_write_dpi(mouseDev, dpi, dpi);
}

/**
* Get the Razer Mouse Dock USB device interface and device name, 
* return JS Null if non found
*/
Napi::Value GetMouseDockDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  mouseDockDev = getRazerUSBDeviceInterface(TYPE_MOUSE_DOCK);
  if (mouseDockDev == NULL) {
    return env.Null();
  }

  char buf[256] = {0};
  razer_mouse_dock_attr_read_device_type(mouseDockDev, buf);
  return Napi::String::New(env, buf);
}

void CloseMouseDockDevice(const Napi::CallbackInfo& info) {
  if (mouseDockDev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(mouseDockDev);

}

void MouseDockSetModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDockDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_mouse_dock_attr_write_mode_static(mouseDockDev, buf, 3);
}

void MouseDockSetModeStaticNoStore(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseDockDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_mouse_dock_attr_write_mode_static_no_store(mouseDockDev, buf, 3);
}

void MouseDockSetModeSpectrum(const Napi::CallbackInfo& info) {
  if (mouseDockDev == NULL) {
    return;
  }
  razer_mouse_dock_attr_write_mode_spectrum(mouseDockDev, "1", 1);
}

void MouseDockSetModeBreathe(const Napi::CallbackInfo& info) {
  if (mouseDockDev == NULL) {
    return;
  }
  razer_mouse_dock_attr_write_mode_breath(mouseDockDev, "1", 1);
}

void MouseDockSetModeNone(const Napi::CallbackInfo& info) {
  if (mouseDockDev == NULL) {
    return;
  }
  razer_mouse_dock_attr_write_mode_none(mouseDockDev, "1", 1);
}


/**
* Get the Razer Mouse Mat USB device interface and device name, 
* return JS Null if non found
*/
Napi::Value GetMouseMatDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  mouseMatDev = getRazerUSBDeviceInterface(TYPE_MOUSE_MAT);
  if (mouseMatDev == NULL) {
    return env.Null();
  }

  char buf[256] = {0};
  razer_mouse_mat_attr_read_device_type(mouseMatDev, buf);
  return Napi::String::New(env, buf);
}


void CloseMouseMatDevice(const Napi::CallbackInfo& info) {
  if (mouseMatDev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(mouseMatDev);

}

void MouseMatSetModeNone(const Napi::CallbackInfo& info) {
  if (mouseMatDev == NULL) {
    return;
  }
  razer_mouse_mat_attr_write_mode_none(mouseMatDev, "1", 1);
}

void MouseMatSetModeWave(const Napi::CallbackInfo& info) {
  if (mouseMatDev == NULL) {
    return;
  }
  if (std::strncmp(info[0].ToString().Utf8Value().c_str(), "left", 4) == 0) {
    razer_mouse_mat_attr_write_mode_wave(mouseMatDev, "1", 0);
  } else {
    razer_mouse_mat_attr_write_mode_wave(mouseMatDev, "2", 0);
  }
}

void MouseMatSetModeBreathe(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseMatDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 1) {
    Napi::TypeError::New(env, "Breathing only accepts '1' (1byte). RGB (3byte). RGB, RGB (6byte)")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_mouse_mat_attr_write_mode_breath(mouseMatDev, buf, 1);
}

void MouseMatSetModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseMatDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_mouse_mat_attr_write_mode_static(mouseMatDev, buf, 3);
}

void MouseMatSetModeStaticNoStore(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (mouseMatDev == NULL) {
    return;
  }

  Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

  if (argsArr.ElementLength() != 3) {
    Napi::TypeError::New(env, "Only accepts RGB (3byte).")
        .ThrowAsJavaScriptException();
    return;
  }
  // Cast unsigned char array into char array
  char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

  razer_mouse_mat_attr_write_mode_static_no_store(mouseMatDev, buf, 3);
}

void MouseMatSetModeSpectrum(const Napi::CallbackInfo& info) {
  if (mouseMatDev == NULL) {
    return;
  }
  razer_mouse_mat_attr_write_mode_spectrum(mouseMatDev, "1", 1);
}

Napi::Value GetHeadphoneDevice(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    headphoneDev = getRazerUSBDeviceInterface(TYPE_HEADPHONE);
    if (headphoneDev == NULL) {
        return env.Null();
    }

    char buf[256] = {0};
    razer_headphone_attr_read_device_type(headphoneDev, buf);
    return Napi::String::New(env, buf);
}

void CloseHeadphoneDevice(const Napi::CallbackInfo &info) {
    if (headphoneDev == NULL) {
        return;
    }
    closeRazerUSBDeviceInterface(headphoneDev);
}

void HeadphoneSetModeStatic(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (headphoneDev == NULL) {
        return;
    }
    Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

    if (argsArr.ElementLength() != 3)
    {
        Napi::TypeError::New(env, "Only accepts RGB (3byte).")
            .ThrowAsJavaScriptException();
        return;
    }
    // Cast unsigned char array into char array
    char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

    razer_headphone_attr_write_mode_static(headphoneDev, buf, 3);
}

void HeadphoneSetModeStaticNoStore(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (headphoneDev == NULL)
    {
        return;
    }

    Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

    if (argsArr.ElementLength() != 3)
    {
        Napi::TypeError::New(env, "Only accepts RGB (3byte).")
            .ThrowAsJavaScriptException();
        return;
    }
    // Cast unsigned char array into char array
    char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

    razer_headphone_attr_write_mode_static_no_store(headphoneDev, buf, 3);
}

void HeadphoneSetModeBreathe(const Napi::CallbackInfo &info)
{
    if (headphoneDev == NULL)
    {
        return;
    }
    razer_headphone_attr_write_mode_breath(headphoneDev, "1", 1);
}

void HeadphoneSetModeNone(const Napi::CallbackInfo &info)
{
    if (headphoneDev == NULL)
    {
        return;
    }
    razer_headphone_attr_write_mode_none(headphoneDev, "1", 1);
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getKeyboardDevice", Napi::Function::New(env, GetKeyboardDevice));
  exports.Set("closeKeyboardDevice", Napi::Function::New(env, CloseKeyboardDevice));
  exports.Set("kbdSetModeNone", Napi::Function::New(env, KbdSetModeNone));
  exports.Set("kbdSetModeSpectrum", Napi::Function::New(env, KbdSetModeSpectrum));
  exports.Set("kbdSetModeStatic", Napi::Function::New(env, KbdSetModeStatic));
  exports.Set("kbdSetModeStaticNoStore", Napi::Function::New(env, KbdSetModeStaticNoStore));
  exports.Set("kbdSetModeWave", Napi::Function::New(env, KbdSetModeWave));
  exports.Set("kbdSetModeReactive", Napi::Function::New(env, KbdSetModeReactive));
  exports.Set("kbdSetModeBreathe", Napi::Function::New(env, KbdSetModeBreathe));
  exports.Set("kbdSetModeStarlight", Napi::Function::New(env, KbdSetModeStarlight));

  exports.Set("getMouseDevice", Napi::Function::New(env, GetMouseDevice));
  exports.Set("getBatteryLevel", Napi::Function::New(env, GetMousebatteryLevel));
  exports.Set("getChargingStatus", Napi::Function::New(env, GetIsMouseCharging));
  exports.Set("closeMouseDevice", Napi::Function::New(env, CloseMouseDevice));
  exports.Set("mouseSetLogoModeWave", Napi::Function::New(env, MouseSetLogoModeWave));
  exports.Set("mouseSetLogoModeStatic", Napi::Function::New(env, MouseSetLogoModeStatic));
  exports.Set("mouseSetLogoModeStaticNoStore", Napi::Function::New(env, MouseSetLogoModeStaticNoStore));
  exports.Set("mouseSetLogoModeSpectrum", Napi::Function::New(env, MouseSetLogoModeSpectrum));
  exports.Set("mouseSetLogoModeReactive", Napi::Function::New(env, MouseSetLogoModeReactive));
  exports.Set("mouseSetLogoModeBreathe", Napi::Function::New(env, MouseSetLogoModeBreathe));
  exports.Set("mouseSetLogoModeNone", Napi::Function::New(env, MouseSetLogoModeNone));

  exports.Set("mouseGetDpi", Napi::Function::New(env, MouseGetDpi));
  exports.Set("mouseSetDpi", Napi::Function::New(env, MouseSetDpi));

  exports.Set("getMouseDockDevice", Napi::Function::New(env, GetMouseDockDevice));
  exports.Set("closeMouseDockDevice", Napi::Function::New(env, CloseMouseDockDevice));
  exports.Set("mouseDockSetModeNone", Napi::Function::New(env, MouseDockSetModeNone));
  exports.Set("mouseDockSetModeBreathe", Napi::Function::New(env, MouseDockSetModeBreathe));
  exports.Set("mouseDockSetModeStatic", Napi::Function::New(env, MouseDockSetModeStatic));
  exports.Set("mouseDockSetModeStaticNoStore", Napi::Function::New(env, MouseDockSetModeStaticNoStore));
  exports.Set("mouseDockSetModeSpectrum", Napi::Function::New(env, MouseDockSetModeSpectrum));

  exports.Set("getMouseMatDevice", Napi::Function::New(env, GetMouseMatDevice));
  exports.Set("closeMouseMatDevice", Napi::Function::New(env, CloseMouseMatDevice));
  exports.Set("mouseMatSetModeNone", Napi::Function::New(env, MouseMatSetModeNone));
  exports.Set("mouseMatSetModeWave", Napi::Function::New(env, MouseMatSetModeWave));
  exports.Set("mouseMatSetModeBreathe", Napi::Function::New(env, MouseMatSetModeBreathe));
  exports.Set("mouseMatSetModeStatic", Napi::Function::New(env, MouseMatSetModeStatic));
  exports.Set("mouseMatSetModeStaticNoStore", Napi::Function::New(env, MouseMatSetModeStaticNoStore));
  exports.Set("mouseMatSetModeSpectrum", Napi::Function::New(env, MouseMatSetModeSpectrum));

  // Older mouse functions
  exports.Set("mouseSetLogoLEDEffect", Napi::Function::New(env, MouseSetLogoLEDEffect));
  exports.Set("mouseSetLogoLEDRGB", Napi::Function::New(env, MouseSetLogoLEDRGB));

  exports.Set("getHeadphoneDevice", Napi::Function::New(env, GetHeadphoneDevice));
  exports.Set("closeHeadphoneDevice", Napi::Function::New(env, CloseHeadphoneDevice));
  exports.Set("headphoneSetModeNone", Napi::Function::New(env, HeadphoneSetModeNone));
  exports.Set("headphoneSetModeBreathe", Napi::Function::New(env, HeadphoneSetModeBreathe));
  exports.Set("headphoneSetModeStatic", Napi::Function::New(env, HeadphoneSetModeStatic));
  exports.Set("headphoneSetModeStaticNoStore", Napi::Function::New(env, HeadphoneSetModeStaticNoStore));

  return exports;
}

NODE_API_MODULE(addon, Init)