import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  plugins: [tsConfigPaths()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        sourcemap: false,
      },
      external: ['electron'],
    },
  },
});
