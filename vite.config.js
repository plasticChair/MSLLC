import { defineConfig } from 'vite';
import { markdownContentPlugin } from './build/content.js';

export default defineConfig({
  plugins: [markdownContentPlugin()],
});