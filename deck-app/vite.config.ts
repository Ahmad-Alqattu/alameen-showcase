import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' so the built folder runs from any path — a subfolder on Pages, a USB stick
// served locally, a laptop at a stand. Nothing in the build knows where it ends up.
// preserveSymlinks is off (the default) on purpose: public/showcase is a symlink into the
// site's own assets, and the build must follow it and copy the real files.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
});
