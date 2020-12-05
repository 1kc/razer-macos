//
//  razerdevice.h
//  Razer device query functions
//
//

#include <IOKit/usb/IOUSBLib.h>
#include <IOKit/IOCFPlugIn.h>
#include <stdio.h>

#include "razerkbd_driver.h"
#include "razermouse_driver.h"
#include "razermousedock_driver.h"
#include "razermousemat_driver.h"
#include "razeregpu_driver.h"

#define TYPE_KEYBOARD 0
#define TYPE_BLADE 1
#define TYPE_MOUSE 2
#define TYPE_MOUSE_DOCK 3
#define TYPE_MOUSE_MAT 4
#define TYPE_EGPU 5
#define TYPE_HEADPHONE 6

#ifndef USB_VENDOR_ID_RAZER
#define USB_VENDOR_ID_RAZER 0x1532
#endif

bool is_keyboard(IOUSBDeviceInterface **dev);
bool is_razer_device(IOUSBDeviceInterface **dev);
IOUSBDeviceInterface **getRazerUSBDeviceInterface(int type);
void closeRazerUSBDeviceInterface(IOUSBDeviceInterface **dev);