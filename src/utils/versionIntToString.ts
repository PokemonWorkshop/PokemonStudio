export const versionIntToString = (int: number) =>
  [Math.floor(int / 16777216), Math.floor(int / 65536), Math.floor(int / 256), Math.floor(int % 256)].join('.');
