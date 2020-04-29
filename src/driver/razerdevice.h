//
//  razerdevice.h
//  Razer device query functions
//
//

#include <IOKit/usb/IOUSBLib.h>
#include <IOKit/IOCFPlugIn.h>
#include <stdio.h>

#include "razerkbd_driver.h"

#ifndef USB_VENDOR_ID_RAZER
#define USB_VENDOR_ID_RAZER 0x1532
#endif

bool is_keyboard(IOUSBDeviceInterface **dev);
bool is_razer_device(IOUSBDeviceInterface **dev);
IOUSBDeviceInterface** getRazerUSBDeviceInterface();
void closeRazerUSBDeviceInterface(IOUSBDeviceInterface **dev);