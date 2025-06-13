import { alias } from './vite.alias.config';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  resolve: {
    alias,
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
});
