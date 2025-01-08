import glsl from 'vite-plugin-glsl'
import glslIncludePlugin from './src/utils/vite-plugin-glsl-include' // Import the plugin
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl({ watch: true }), glslIncludePlugin()],
  resolve: {
    alias: [
      {
        find: '~',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
})

