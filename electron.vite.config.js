import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// The project already matches electron-vite's conventions, so entry points are
// discovered automatically: src/main/index.js and src/renderer/index.html.
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        // Without this, `import { ipcRenderer } from 'electron'` in the renderer
        // resolves to npm's electron package, which only reports the binary path.
        electron: resolve(__dirname, 'src/renderer/electron-bridge.js'),
      },
    },
    build: {
      // react-color and friends still reach for this.
      commonjsOptions: { transformMixedEsModules: true },
    },
  },
});
