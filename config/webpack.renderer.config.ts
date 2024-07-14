import path from 'path';
import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
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
    },
  },
};
