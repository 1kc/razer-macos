#include <napi.h>

extern "C" {
  #include "razerdevice.h"
  #include "razerkbd_driver.h"
  #include "razermouse_driver.h"
}


IOUSBDeviceInterface **dev;

/**
* Get the Razer USB device interface and device name, 
* return JS Null if non found
*/
Napi::Value GetDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  dev = getRazerUSBDeviceInterface(TYPE_MOUSE);
  if (dev == NULL) {
    return env.Null();
  }

  char buf[256] = {0};
  // razer_attr_read_device_type(dev, buf);
  razer_mouse_attr_read_device_type(dev, buf);
  return Napi::String::New(env, buf);
}

void CloseDevice(const Napi::CallbackInfo& info) {
  if (dev == NULL) {
    return;
  }
  closeRazerUSBDeviceInterface(dev);
}

void SetModeNone(const Napi::CallbackInfo& info) {
  if (dev == NULL) {
    return;
  }
  razer_attr_write_mode_none(dev, "1", 1);
}

void SetModeSpectrum(const Napi::CallbackInfo& info) {
  if (dev == NULL) {
    return;
  }
  razer_attr_write_mode_spectrum(dev, "1", 1);
}

void SetModeWave(const Napi::CallbackInfo& info) {
  if (dev == NULL) {
    return;
  }
  if (std::strncmp(info[0].ToString().Utf8Value().c_str(), "left", 4) == 0) {
    razer_attr_write_mode_wave(dev, "1", 0);
  } else {
    razer_attr_write_mode_wave(dev, "2", 0);
  }
}

void SetModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (dev == NULL) {
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

  razer_attr_write_mode_static(dev, buf, 3);
}


void SetModeReactive(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (dev == NULL) {
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

  razer_attr_write_mode_reactive(dev, buf, 4);
}

void SetModeBreathe(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (dev == NULL) {
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

  razer_attr_write_mode_breath(dev, buf, 1);
}

void SetModeStarlight(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (dev == NULL) {
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

  razer_attr_write_mode_starlight(dev, buf, 4);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getDevice", Napi::Function::New(env, GetDevice));
  exports.Set("closeDevice", Napi::Function::New(env, CloseDevice));
  exports.Set("setModeNone", Napi::Function::New(env, SetModeNone));
  exports.Set("setModeSpectrum", Napi::Function::New(env, SetModeSpectrum));
  exports.Set("setModeStatic", Napi::Function::New(env, SetModeStatic));
  exports.Set("setModeWave", Napi::Function::New(env, SetModeWave));
  exports.Set("setModeReactive", Napi::Function::New(env, SetModeReactive));
  exports.Set("setModeBreathe", Napi::Function::New(env, SetModeBreathe));
  exports.Set("setModeStarlight", Napi::Function::New(env, SetModeStarlight));
  return exports;
}

NODE_API_MODULE(addon, Init)