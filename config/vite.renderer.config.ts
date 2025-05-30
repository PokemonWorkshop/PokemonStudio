import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@components': path.resolve(__dirname, '..', 'src/views/components'),
      '@ds': path.resolve(__dirname, '..', 'src/designSystem'),
      '@pages': path.resolve(__dirname, '..', 'src/views/pages'),
      '@modelEntities': path.resolve(__dirname, '..', 'src/models/entities'),
      '@services': path.resolve(__dirname, '..', 'src/services'),
      '@utils': path.resolve(__dirname, '..', 'src/utils'),
      '@assets': path.resolve(__dirname, '..', 'assets'),
      '@src': path.resolve(__dirname, '..', 'src'),
      '@hooks': path.resolve(__dirname, '..', 'src/hooks'),
      '@poc': path.resolve(__dirname, '..', 'src/poc'),
    },
  },
  plugins: [react()],
});
