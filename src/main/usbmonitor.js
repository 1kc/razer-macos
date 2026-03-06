import usb from 'usb';

/**
 * USB Device Monitor for detecting Razer device connections/disconnections
 * Used for KVM setup - auto-refresh when devices reconnect
 */
export class USBMonitor {
  constructor(deviceManager, stateManager) {
    this.deviceManager = deviceManager;
    this.stateManager = stateManager;
    this.isMonitoring = false;
    this.razerVendorIds = [0x1532]; // Razer vendor ID
    this.detachedDevices = new Set();
  }

  /**
   * Start monitoring USB events
   */
  start() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    // Listen for device attachment
    usb.on('attach', (device) => {
      this.handleDeviceAttach(device);
    });

    // Listen for device detachment
    usb.on('detach', (device) => {
      this.handleDeviceDetach(device);
    });

    console.log('[USBMonitor] Started monitoring USB events');
  }

  /**
   * Stop monitoring USB events
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    usb.removeAllListeners('attach');
    usb.removeAllListeners('detach');
    this.isMonitoring = false;
    
    console.log('[USBMonitor] Stopped monitoring USB events');
  }

  /**
   * Handle USB device attachment
   */
  handleDeviceAttach(device) {
    const vendorId = device.deviceDescriptor.idVendor;
    const productId = device.deviceDescriptor.idProduct;

    // Check if it's a Razer device
    if (this.isRazerDevice(vendorId)) {
      console.log(`[USBMonitor] Razer device attached: ${productId.toString(16)}`);
      
      // Check if this device was previously detached (KVM scenario)
      const deviceKey = `${vendorId}-${productId}`;
      const wasDetached = this.detachedDevices.has(deviceKey);
      
      // Wait a moment for the device to be ready
      setTimeout(() => {
        this.refreshAndRestore(deviceKey, wasDetached);
      }, 1000);

      // Remove from detached list
      this.detachedDevices.delete(deviceKey);
    }
  }

  /**
   * Handle USB device detachment
   */
  handleDeviceDetach(device) {
    const vendorId = device.deviceDescriptor.idVendor;
    const productId = device.deviceDescriptor.idProduct;

    // Check if it's a Razer device
    if (this.isRazerDevice(vendorId)) {
      console.log(`[USBMonitor] Razer device detached: ${productId.toString(16)}`);
      
      // Track this device as detached
      const deviceKey = `${vendorId}-${productId}`;
      this.detachedDevices.add(deviceKey);
    }
  }

  /**
   * Check if device is from Razer
   */
  isRazerDevice(vendorId) {
    return this.razerVendorIds.includes(vendorId);
  }

  /**
   * Refresh devices and restore lighting
   */
  async refreshAndRestore(deviceKey, wasDetached) {
    try {
      console.log('[USBMonitor] Refreshing device list...');
      
      // Refresh the device list
      await this.deviceManager.refreshRazerDevices();
      
      // If this was a reconnection (KVM scenario), restore the lighting
      if (wasDetached && this.deviceManager.activeRazerDevices) {
        console.log('[USBMonitor] Restoring lighting for reconnected devices');
        
        // Small delay to ensure devices are fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Apply current state to all active devices
        if (this.stateManager) {
          await this.stateManager.applyCurrentState();
        }
      }
    } catch (error) {
      console.error('[USBMonitor] Error during refresh:', error);
    }
  }

  /**
   * Check if currently monitoring
   */
  get isActive() {
    return this.isMonitoring;
  }
}
