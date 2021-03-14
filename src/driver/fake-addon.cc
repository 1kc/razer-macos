#include <napi.h>

/**
* This file is can be used as a fake-addon. It reports a fixed set of devices and returns dummy values.
* - allows "appearance test" for new devices (see GetFakeDevices)
* - allows frontend changes to be made on different OS than macOS
*/

Napi::Number FakeCall(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    return Napi::Number::New(env, -1);
}

Napi::Array GetFakeDevices(const Napi::CallbackInfo &info) {

    const int arrayLength = 7;
    int fakeDevices [arrayLength] = { 0x006C, 0x025E, 0x0C02, 0x0527, 0x0517, 0x0F20, 0x0f1a };

    Napi::Env env = info.Env();
    Napi::Array razerDevices = Napi::Array::New(env, arrayLength);

    for (int counter = 0; counter < arrayLength; ++counter) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("productId", Napi::Number::New(env, fakeDevices[counter]));
        obj.Set("internalDeviceId", Napi::Number::New(env, counter+1));
        razerDevices[counter] = obj;
    }

    return razerDevices;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {

    exports.Set("kbdSetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeSpectrum", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeWave", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeReactive", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("KbdGetBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("KbdSetBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeStarlight", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetModeCustom", Napi::Function::New(env, FakeCall));
    exports.Set("kbdSetCustomFrame", Napi::Function::New(env, FakeCall));

    exports.Set("getBatteryLevel", Napi::Function::New(env, FakeCall));
    exports.Set("getChargingStatus", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeWave", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeSpectrum", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeReactive", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoModeNone", Napi::Function::New(env, FakeCall));

    exports.Set("mouseGetDpi", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetDpi", Napi::Function::New(env, FakeCall));

    exports.Set("mouseGetPollRate", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetPollRate", Napi::Function::New(env, FakeCall));

    exports.Set("mouseGetScrollBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetScrollBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseGetLogoBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseGetLeftBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLeftBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseGetRightBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetRightBrightness", Napi::Function::New(env, FakeCall));

    exports.Set("mouseDockSetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("mouseDockSetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("mouseDockSetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("mouseDockSetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("mouseDockSetModeSpectrum", Napi::Function::New(env, FakeCall));

    exports.Set("mouseMatSetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("mouseMatSetModeWave", Napi::Function::New(env, FakeCall));
    exports.Set("mouseMatSetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("mouseMatSetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("mouseMatSetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("mouseMatSetModeSpectrum", Napi::Function::New(env, FakeCall));

    // Older mouse functions
    exports.Set("mouseSetLogoLEDEffect", Napi::Function::New(env, FakeCall));
    exports.Set("mouseSetLogoLEDRGB", Napi::Function::New(env, FakeCall));

    // Egpu
    exports.Set("egpuSetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("egpuSetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("egpuSetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("egpuSetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("egpuSetModeWave", Napi::Function::New(env, FakeCall));
    exports.Set("egpuSetModeSpectrum", Napi::Function::New(env, FakeCall));

    // Headphones
    exports.Set("headphoneSetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("headphoneSetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("headphoneSetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("headphoneSetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("headphoneSetModeSpectrum", Napi::Function::New(env, FakeCall));

    // Accessory
    exports.Set("accessorySetModeNone", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetModeSpectrum", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetModeStatic", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetModeStaticNoStore", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetModeWave", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetModeBreathe", Napi::Function::New(env, FakeCall));
    exports.Set("accessoryGetBrightness", Napi::Function::New(env, FakeCall));
    exports.Set("accessorySetBrightness", Napi::Function::New(env, FakeCall));

    // All devices
    exports.Set("getAllDevices", Napi::Function::New(env, GetFakeDevices));
    exports.Set("closeAllDevices", Napi::Function::New(env, FakeCall));

    return exports;
}

NODE_API_MODULE(addon, Init)