import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import { alias } from './vite.alias.config';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, '../src/renderer/index.html'),
      },
      output: {
        dir: '.vite/renderer/main_window',
      },
    },
  },
  plugins: [
    react(),
    svgr({ include: '**/*.svg' }),
    viteStaticCopy({
      targets: [
        {
          src: ['../../assets/fonts'],
          dest: path.resolve(__dirname, '../.vite/renderer'),
        },
      ],
    }),
  ],
  resolve: {
    alias,
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  root: path.resolve(__dirname, '../src/renderer'),
});
