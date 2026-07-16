import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  envDir: '../../',
  define: {
    global: 'globalThis', // required for viem
  },
  resolve: {
    alias: {
      '@noble/curves/nist.js': '@noble/curves/nist', // required for permissionless
    },
  },
})