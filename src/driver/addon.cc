#include <napi.h>

extern "C" {
  // Get declaration for f(int i, char c, float x)
  #include "razerdevice.h"
  #include "razerkbd_driver.h"
}

// #include <stdio.h>
// #include <string.h>
// #include <stdlib.h>


// Example from https://github.com/nodejs/node-addon-examples/tree/master/3_callbacks/node-addon-api

// Napi::Value Add(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();
//   if (info.Length() < 2) {
//     Napi::TypeError::New(env, "Wrong number of arguments")
//         .ThrowAsJavaScriptException();
//     return env.Null();
//   }

//   if (!info[0].IsNumber() || !info[1].IsNumber()) {
//     Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
//     return env.Null();
//   }

//   double arg0 = info[0].As<Napi::Number>().DoubleValue();
//   double arg1 = info[1].As<Napi::Number>().DoubleValue();
//   Napi::Number num = Napi::Number::New(env, arg0 + arg1);

//   return num;
// }

IOUSBDeviceInterface **dev;

Napi::String GetDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  dev = getRazerUSBDeviceInterface();

  char buf[256] = {0};
  razer_attr_read_device_type(dev, buf);

  return Napi::String::New(env, buf);
}

Napi::String CloseDevice(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  closeRazerUSBDeviceInterface(dev);
  return Napi::String::New(env, "done");
}

Napi::String SetModeNone(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  razer_attr_write_mode_none(dev, "1", 1);
  return Napi::String::New(env, "done");
}

Napi::String SetModeSpectrum(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  razer_attr_write_mode_spectrum(dev, "1", 1);
  return Napi::String::New(env, "done");
}

Napi::String SetModeWave(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  razer_attr_write_mode_wave(dev, "1", 0);
  return Napi::String::New(env, "done");
}

Napi::String SetModeStatic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // Just set to white for now
  char buf[3] = {0,0,0};
  buf[0] = buf[1] = buf[2] = 0xff;
  razer_attr_write_mode_static(dev, buf, 3);
  return Napi::String::New(env, "done");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  // exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
  exports.Set(Napi::String::New(env, "getDevice"), Napi::Function::New(env, GetDevice));
  exports.Set(Napi::String::New(env, "closeDevice"), Napi::Function::New(env, CloseDevice));
  exports.Set(Napi::String::New(env, "setModeNone"), Napi::Function::New(env, SetModeNone));
  exports.Set(Napi::String::New(env, "setModeSpectrum"), Napi::Function::New(env, SetModeSpectrum));
  exports.Set(Napi::String::New(env, "setModeStatic"), Napi::Function::New(env, SetModeStatic));
  exports.Set(Napi::String::New(env, "setModeWave"), Napi::Function::New(env, SetModeWave));
  return exports;
}

NODE_API_MODULE(addon, Init)