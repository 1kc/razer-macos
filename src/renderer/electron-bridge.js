// electron-vite does not support nodeIntegration, so the renderer cannot import
// electron directly. The renderer build aliases 'electron' to this module, which
// hands back the surface exposed by src/preload/index.js. Call sites are
// unchanged: `import { ipcRenderer } from 'electron'` still works.
export const ipcRenderer = window.electronIPC;
