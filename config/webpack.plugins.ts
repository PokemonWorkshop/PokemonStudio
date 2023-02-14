import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
