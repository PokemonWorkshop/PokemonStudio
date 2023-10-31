import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

const assets = ['assets/fonts'];
const CopyPlugins =
  process.env.npm_command === 'start'
    ? []
    : [
        new CopyWebpackPlugin({
          patterns: assets.map((asset) => ({
            from: path.resolve(__dirname, '../', asset),
            to: path.resolve(__dirname, '../.webpack/renderer', asset),
          })),
        }),
      ];

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new ReactRefreshWebpackPlugin(),
  ...CopyPlugins,
];
