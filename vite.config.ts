import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on GitHub Pages subpaths as well as root hosts.
export default defineConfig({
  base: './',
  plugins: [react()],
});
