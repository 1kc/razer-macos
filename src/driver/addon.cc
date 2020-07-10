#include <napi.h>

extern "C" {
  #include "razerdevice.h"
  #include "razerkbd_driver.h"
  #include "razermouse_driver.h"
}


IOUSBDeviceInterface **kbdDev;
IOUSBDeviceInterface **mouseDev;

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


void CloseMouseDevice(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(mouseDev);

}


// void MouseSetLogoLEDEffect(const Napi::CallbackInfo& info) {
//   if (mouseDev == NULL) {
//     return;
//   }
//   const char* effect =  info[0].ToString().Utf8Value().c_str();

//   if (std::strncmp(effect, "static", 6) == 0) {
//     razer_attr_write_logo_led_effect(mouseDev, "0", 1);
//   } else if (std::strncmp(effect, "blinking", 8) == 0) {
//     razer_attr_write_logo_led_effect(mouseDev, "1", 1);
//   } else if (std::strncmp(effect, "pulsate", 7) == 0) {
//     razer_attr_write_logo_led_effect(mouseDev, "2", 1);
//   } else if (std::strncmp(effect, "scroll", 6) == 0) {
//     razer_attr_write_logo_led_effect(mouseDev, "4", 1);
//   }

// }

// void MouseSetLogoLEDRGB(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();
//   if (mouseDev == NULL) {
//     return;
//   }

//   Napi::Uint8Array argsArr = info[0].As<Napi::Uint8Array>();

//   if (argsArr.ElementLength() != 3) {
//     Napi::TypeError::New(env, "Only accepts RGB (3byte).")
//         .ThrowAsJavaScriptException();
//     return;
//   }
//   // Cast unsigned char array into char array
//   char *buf = (char *)info[0].As<Napi::Uint8Array>().Data();

//   razer_attr_write_logo_led_rgb(mouseDev, buf, 3);
// }

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
}

void MouseSetLogoModeNone(const Napi::CallbackInfo& info) {
  if (mouseDev == NULL) {
    return;
  }
  razer_attr_write_logo_mode_none(mouseDev, "1", 1);
}



Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getKeyboardDevice", Napi::Function::New(env, GetKeyboardDevice));
  exports.Set("closeKeyboardDevice", Napi::Function::New(env, CloseKeyboardDevice));
  exports.Set("kbdSetModeNone", Napi::Function::New(env, KbdSetModeNone));
  exports.Set("kbdSetModeSpectrum", Napi::Function::New(env, KbdSetModeSpectrum));
  exports.Set("kbdSetModeStatic", Napi::Function::New(env, KbdSetModeStatic));
  exports.Set("kbdSetModeWave", Napi::Function::New(env, KbdSetModeWave));
  exports.Set("kbdSetModeReactive", Napi::Function::New(env, KbdSetModeReactive));
  exports.Set("kbdSetModeBreathe", Napi::Function::New(env, KbdSetModeBreathe));
  exports.Set("kbdSetModeStarlight", Napi::Function::New(env, KbdSetModeStarlight));

  exports.Set("getMouseDevice", Napi::Function::New(env, GetMouseDevice));
  exports.Set("closeMouseDevice", Napi::Function::New(env, CloseMouseDevice));
  exports.Set("mouseSetLogoModeStatic", Napi::Function::New(env, MouseSetLogoModeStatic));
  exports.Set("mouseSetLogoModeNone", Napi::Function::New(env, MouseSetLogoModeNone));



  // Older mouse functions
  // exports.Set("mouseSetLogoLEDEffect", Napi::Function::New(env, MouseSetLogoLEDEffect));
  // exports.Set("mouseSetLogoLEDRGB", Napi::Function::New(env, MouseSetLogoLEDRGB));
  return exports;
}

NODE_API_MODULE(addon, Init)