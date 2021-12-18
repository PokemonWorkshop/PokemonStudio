module.exports = {
  extends: [
    'erb',
    'plugin:import/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/typescript',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',

    // We use named exports in our components structure
    'import/prefer-default-export': 'off',
    'react/jsx-uses-react': 'warn',
    'func-names': ['error', 'always'],
    'no-unused-vars': 'off',
    'prettier/prettier': [
      'error',
      {
        arrowParens: 'always',
        printWidth: 150,
        trailingComma: 'es5',
        jsxSingleQuote: false,
        singleQuote: true,
      },
      {
        usePrettierrc: false,
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  ignorePatterns: ['src/__tests__/*'],
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      typescript: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    react: {
      pragma: 'React',
      version: '17.0.1',
    },
  },
};
