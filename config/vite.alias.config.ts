import { resolve } from 'path';

export const alias = {
  '@root': resolve(__dirname, '../'),
  '@components': resolve(__dirname, '../src/views/components'),
  '@ds': resolve(__dirname, '../src/designSystem'),
  '@pages': resolve(__dirname, '../src/views/pages'),
  '@modelEntities': resolve(__dirname, '../src/models/entities'),
  '@services': resolve(__dirname, '../src/services'),
  '@utils': resolve(__dirname, '../src/utils'),
  '@assets': resolve(__dirname, '../assets'),
  '@src': resolve(__dirname, '../src'),
  '@hooks': resolve(__dirname, '../src/hooks'),
  '@poc': resolve(__dirname, '../src/poc'),
};
