import path from 'path';
import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
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
    },
  },
};
