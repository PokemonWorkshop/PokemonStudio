import { app } from 'electron';

export const getAppRootPath = () => {
  const appPath = app.getAppPath().replaceAll('\\', '/');
  if (appPath.endsWith('resources/app.asar')) return appPath.replace(/resources\/app\.asar$/, '');
  // Please add Contents/ before Resources if that's still not enough!
  if (appPath.endsWith('Resources/app.asar')) return appPath.replace(/Resources\/app\.asar$/, '');
  if (appPath.endsWith('src')) return appPath.replace(/src$/, '');

  return appPath;
};
