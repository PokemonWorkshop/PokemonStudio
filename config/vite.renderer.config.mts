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
        index: process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '../src/renderer/index.html') : path.resolve(__dirname, 'index.html'),
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
