/**
 * Watch passive registry snapshots. Opening USB handles belongs to the
 * application's serialized refresh transaction, never to this polling loop.
 */
export class RazerDeviceMonitor {
  constructor(application) {
    this.application = application;
    this.running = false;
    this.timer = null;
    this.lastTopology = null;
    this.pendingTopology = null;
    this.pollMs = 1000;
    this.settleMs = 300;
    this.retryMs = this.pollMs;
    this.lastError = null;
  }

  start() {
    if (this.running || this.application.destroyed) {
      return;
    }
    const addon = this.application.deviceManager.addon;
    if (!addon || typeof addon.getDeviceTopology !== 'function') {
      console.warn('Automatic reconnect requires the rebuilt device topology addon.');
      return;
    }
    this.running = true;
    this.schedule(this.pollMs);
  }

  stop() {
    this.running = false;
    clearTimeout(this.timer);
    this.timer = null;
    this.pendingTopology = null;
  }

  accept(topology) {
    if (topology == null) {
      return;
    }
    this.lastTopology = topology.fingerprint;
    this.pendingTopology = null;
    this.retryMs = this.pollMs;
    this.lastError = null;
  }

  invalidate() {
    // A failed manual refresh also needs another attempt if USB is unchanged.
    this.lastTopology = null;
    this.pendingTopology = null;
  }

  schedule(delay) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.poll(), delay);
    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  async poll() {
    this.timer = null;
    if (!this.running) {
      return;
    }
    let delay = this.pollMs;
    try {
      const topology = this.application.deviceManager.readTopology();
      if (topology.fingerprint === this.lastTopology) {
        this.pendingTopology = null;
        this.retryMs = this.pollMs;
        this.lastError = null;
      } else if (topology.fingerprint !== this.pendingTopology) {
        // Require two equal observations separated by the settle interval.
        this.pendingTopology = topology.fingerprint;
        delay = this.settleMs;
      } else {
        await this.application.refresh(false, true);
        // refresh accepts only the topology observed by that transaction.
        // A connection change during opening is detected by the next poll.
      }
    } catch (error) {
      if (!this.running) {
        return;
      }
      this.pendingTopology = null;
      delay = this.retryMs;
      this.retryMs = Math.min(10000, this.retryMs * 2);
      const message = error && error.message ? error.message : String(error);
      if (message !== this.lastError) {
        console.warn('Automatic device refresh deferred:', message);
        this.lastError = message;
      }
    } finally {
      if (this.running) {
        this.schedule(delay);
      }
    }
  }
}