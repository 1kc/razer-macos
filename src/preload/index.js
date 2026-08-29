import { contextBridge, ipcRenderer } from 'electron';

// The renderer only ever calls send, sendSync and on. Exposing the whole
// ipcRenderer across the bridge would hand the page arbitrary IPC, so this
// forwards just those three.
const api = {
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  sendSync: (channel, ...args) => ipcRenderer.sendSync(channel, ...args),
  on: (channel, listener) => {
    // Electron's IpcRendererEvent is not structured-cloneable, so it cannot
    // cross the contextBridge: forwarding it makes the call fail silently and
    // the listener never runs. Pass null in its place, since call sites use the
    // (event, message) signature but only ever read message.
    const subscription = (_event, ...args) => listener(null, ...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
};

contextBridge.exposeInMainWorld('electronIPC', api);
