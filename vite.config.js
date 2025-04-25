import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './', // Use the current directory as root
  publicDir: 'public', // Static assets folder (create this if you need it)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true, // Automatically open browser
    port: 3000,
  },
});