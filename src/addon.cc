#include <napi.h>

extern "C" {
  // Get declaration for f(int i, char c, float x)
  #include "razerdevice.h"
  #include "razerkbd_driver.h"
}

// #include <stdio.h>
// #include <string.h>
// #include <stdlib.h>



Napi::Value Add(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  double arg0 = info[0].As<Napi::Number>().DoubleValue();
  double arg1 = info[1].As<Napi::Number>().DoubleValue();
  Napi::Number num = Napi::Number::New(env, arg0 + arg1);

  return num;
}

Napi::String ReadDeviceType(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  IOUSBDeviceInterface **dev = getRazerUSBDeviceInterface();

  //razer_attr_read_get_firmware_version(dev, buf);
	//razer_attr_read_device_type(dev, buf);

  razer_attr_write_mode_wave(dev, "1", 0);

  return Napi::String::New(env, "done");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
  exports.Set(Napi::String::New(env, "readDeviceType"), Napi::Function::New(env, ReadDeviceType));
  return exports;
}

NODE_API_MODULE(addon, Init)