#include "razerdevice.h"

bool is_razer_device(IOUSBDeviceInterface **dev) {
    kern_return_t kr;
    UInt16 vendor;
    UInt16 product;
    UInt16 release;

    kr = (*dev)->GetDeviceVendor(dev, &vendor);
    kr = (*dev)->GetDeviceProduct(dev, &product);
    kr = (*dev)->GetDeviceReleaseNumber(dev, &release);

    return vendor == USB_VENDOR_ID_RAZER;
}

bool is_keyboard(IOUSBDeviceInterface **usb_dev) {
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);
    
    switch (product) {        
		case USB_DEVICE_ID_RAZER_NOSTROMO:
		case USB_DEVICE_ID_RAZER_ORBWEAVER:
		case USB_DEVICE_ID_RAZER_ORBWEAVER_CHROMA:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_STEALTH:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_STEALTH_EDITION:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_ULTIMATE_2012:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_ULTIMATE_2013:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_ULTIMATE_2016:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_X_ULTIMATE:
		case USB_DEVICE_ID_RAZER_TARTARUS:
		case USB_DEVICE_ID_RAZER_TARTARUS_CHROMA:
		case USB_DEVICE_ID_RAZER_TARTARUS_V2:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_OVERWATCH:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_CHROMA:
		case USB_DEVICE_ID_RAZER_DEATHSTALKER_EXPERT:
		case USB_DEVICE_ID_RAZER_DEATHSTALKER_CHROMA:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_CHROMA_TE:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_X_CHROMA:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_X_CHROMA_TE:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_LITE:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_2019:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_ESSENTIAL:
		case USB_DEVICE_ID_RAZER_ORNATA:
		case USB_DEVICE_ID_RAZER_ORNATA_CHROMA:
		case USB_DEVICE_ID_RAZER_HUNTSMAN_ELITE:
		case USB_DEVICE_ID_RAZER_HUNTSMAN_TE:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_ELITE:
		case USB_DEVICE_ID_RAZER_HUNTSMAN:
		case USB_DEVICE_ID_RAZER_CYNOSA_CHROMA:
		case USB_DEVICE_ID_RAZER_BLACKWIDOW_CHROMA_V2:
		case USB_DEVICE_ID_RAZER_ANANSI:
            return true;
    }
    
    return false;
}

bool is_mouse(IOUSBDeviceInterface **usb_dev) {
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);
    
    switch (product) {        
		case USB_DEVICE_ID_RAZER_OROCHI_2011:
		case USB_DEVICE_ID_RAZER_DEATHADDER_3_5G:
		case USB_DEVICE_ID_RAZER_ABYSSUS_1800:
		case USB_DEVICE_ID_RAZER_MAMBA_2012_WIRED:
		case USB_DEVICE_ID_RAZER_MAMBA_2012_WIRELESS:
		case USB_DEVICE_ID_RAZER_NAGA_2012:
		case USB_DEVICE_ID_RAZER_IMPERATOR:
		case USB_DEVICE_ID_RAZER_OUROBOROS:
		case USB_DEVICE_ID_RAZER_TAIPAN:
		case USB_DEVICE_ID_RAZER_NAGA_HEX_RED:
		case USB_DEVICE_ID_RAZER_DEATHADDER_2013:
		case USB_DEVICE_ID_RAZER_DEATHADDER_1800:
		case USB_DEVICE_ID_RAZER_OROCHI_2013:
		case USB_DEVICE_ID_RAZER_NAGA_2014:
		case USB_DEVICE_ID_RAZER_NAGA_HEX:
		case USB_DEVICE_ID_RAZER_ABYSSUS:
		case USB_DEVICE_ID_RAZER_DEATHADDER_CHROMA:
		case USB_DEVICE_ID_RAZER_MAMBA_WIRED:
		case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS:
		case USB_DEVICE_ID_RAZER_MAMBA_TE_WIRED:
		case USB_DEVICE_ID_RAZER_OROCHI_CHROMA:
		case USB_DEVICE_ID_RAZER_DIAMONDBACK_CHROMA:
		case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
		case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
		case USB_DEVICE_ID_RAZER_DEATHADDER_3500:
		case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
		case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
		case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
		case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
		case USB_DEVICE_ID_RAZER_ABYSSUS_2000:
		case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
		case USB_DEVICE_ID_RAZER_BASILISK:
		case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
		case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
		case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
		case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
		case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
		case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
		case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
		case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
		case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
		case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
		case USB_DEVICE_ID_RAZER_VIPER:
		case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
		case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
		case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            return true;
    }
    
    return false;
}

IOUSBDeviceInterface** getRazerUSBDeviceInterface(int type) {
	CFMutableDictionaryRef matchingDict;
	matchingDict = IOServiceMatching(kIOUSBDeviceClassName);
	if (matchingDict == NULL) {
		return NULL;
	}
	
	io_iterator_t iter;
	kern_return_t kReturn =
		IOServiceGetMatchingServices(kIOMasterPortDefault, matchingDict, &iter);
	if (kReturn != kIOReturnSuccess) {
		return NULL;
	}

	io_service_t usbDevice;
	while ((usbDevice = IOIteratorNext(iter))) {
		IOCFPlugInInterface **plugInInterface = NULL;
		SInt32 score;
		
		kReturn = IOCreatePlugInInterfaceForService(
			usbDevice, kIOUSBDeviceUserClientTypeID, kIOCFPlugInInterfaceID, &plugInInterface, &score);
		
		IOObjectRelease(usbDevice);  // Not needed after plugin created
		if ((kReturn != kIOReturnSuccess) || plugInInterface == NULL) {
			// printf("Unable to create plugin (0x%08x)\n", kReturn);
			continue;
		}
		
		IOUSBDeviceInterface **dev = NULL;
		HRESULT hResult = (*plugInInterface)->QueryInterface(
			plugInInterface, CFUUIDGetUUIDBytes(kIOUSBDeviceInterfaceID), (LPVOID *)&dev);
		
		(*plugInInterface)->Release(plugInInterface);  // Not needed after device interface created
		if (hResult || !dev) {
			// printf("Couldn’t create a device interface (0x%08x)\n", (int) hResult);
			continue;
		}
		
		// Filter out non-Razer devices
		if (!is_razer_device(dev)) {
			(*dev)->Release(dev);
			continue;
		}

		switch (type) {
			case TYPE_KEYBOARD:
			case TYPE_BLADE:
				// Filter out non-keyboards and non-blade laptops
				if (!(is_keyboard(dev) || is_blade_laptop(dev))) {
					(*dev)->Release(dev);
					continue;
				}
				break;
			case TYPE_MOUSE:
				// Filter out non-mice
				if (!is_mouse(dev)) {
					(*dev)->Release(dev);
					continue;
				}
				break;
			default:
				// Unsupported Razer peripheral type
				(*dev)->Release(dev);
				continue;
		}



		
		kReturn = (*dev)->USBDeviceOpen(dev);
		if (kReturn != kIOReturnSuccess)  {
			printf("Unable to open USB device: %08x\n", kReturn);
			(*dev)->Release(dev);
			continue;
		}
		
		// Success. We found the Razer USB device.
		// Caller is responsible for closing USB and release device.
		IOObjectRelease(iter);
		return dev;
	}
	
	IOObjectRelease(iter);
	return NULL;
}

void closeRazerUSBDeviceInterface(IOUSBDeviceInterface **dev) {
	kern_return_t kr;
	kr = (*dev)->USBDeviceClose(dev);
    kr = (*dev)->Release(dev);
}
