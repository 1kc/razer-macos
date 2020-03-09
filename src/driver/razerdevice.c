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

IOUSBDeviceInterface** getRazerUSBDeviceInterface() {
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
		
		if (!is_razer_device(dev)) {
			(*dev)->Release(dev);	// Not recognized as a Razer Blade Laptop device
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