/* eslint global-require: off, import/no-extraneous-dependencies: off */

const developmentEnvironments = ['development', 'test'];

const developmentPlugins = [require('@babel/plugin-transform-runtime')];

const productionPlugins = [
  require('babel-plugin-dev-expression'),

  // babel-preset-react-optimize
  require('@babel/plugin-transform-react-constant-elements'),
  require('@babel/plugin-transform-react-inline-elements'),
  require('babel-plugin-transform-react-remove-prop-types'),
];

module.exports = (api) => {
  // See docs about api at https://babeljs.io/docs/en/config-files#apicache

  const development = api.env(developmentEnvironments);

  return {
    presets: [
      // @babel/preset-env will automatically target our browserslist targets
      require('@babel/preset-env'),
      require('@babel/preset-typescript'),
      [require('@babel/preset-react'), { development }],
    ],
    plugins: [
      // Used to have @JsonBlaBlaBla
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],

      // Allow Models to work with decorator over class
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      require('@babel/plugin-proposal-json-strings'),
      [require('@babel/plugin-proposal-private-methods'), { loose: true }],
      [require('@babel/plugin-proposal-private-property-in-object'), { loose: true }],

      // Styled Components config
      [require('babel-plugin-styled-components'), { displayName: true, ssr: false }],

      // Resolving alias path
      [
        'module-resolver',
        {
          alias: {
            '@components': './src/views/components',
            '@pages': './src/views/pages/',
            '@modelEntities': './src/models/entities',
            '@services': './src/services',
            '@utils': './src/utils',
            '@assets': './assets',
            '@src': './src',
          },
        },
      ],
      // Other plugins
      ...(development ? developmentPlugins : productionPlugins),
    ],
  };
};
