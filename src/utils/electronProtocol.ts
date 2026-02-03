import { app, protocol } from 'electron';
import electronIsDev from 'electron-is-dev';
import path from 'path';
import fs from 'fs';
import querystring from 'querystring';
import { getAppRootPath } from '@src/backendTasks/getAppRootPath';

const FALLBACK_IMAGE = path.join(getAppRootPath(), 'placeholder.svg');

const fallbackImage = (projectPath: string, fallback: string | null, callBack: (response: string | Electron.ProtocolResponse) => void) => {
  if (!projectPath || !fallback) return callBack(FALLBACK_IMAGE);

  const fallbackPath = path.join(projectPath, fallback);
  if (fs.existsSync(fallbackPath + '.gif')) return callBack(fallbackPath + '.gif');
  if (fs.existsSync(fallbackPath + '.png')) return callBack(fallbackPath + '.png');
  if (fs.existsSync(fallbackPath)) return callBack(fallbackPath);
  return callBack(FALLBACK_IMAGE);
};

export const registerElectronProtocolWhenAppRead = () => {
  protocol.registerFileProtocol('project', (request, callBack) => {
    const url = new URL(request.url);
    const projectPath = url.searchParams.get('projectPath');
    if (!projectPath) return callBack(FALLBACK_IMAGE);

    const resourceType = url.searchParams.get('type');
    const filepath = path.join(projectPath, querystring.unescape(url.pathname));
    if (resourceType === 'image') {
      const isExtension = filepath.endsWith('.png') || filepath.endsWith('.gif');
      if (isExtension) {
        if (!fs.existsSync(filepath)) {
          const fallback = url.searchParams.get('fallback');
          return fallbackImage(projectPath, fallback, callBack);
        }
      } else {
        if (fs.existsSync(filepath + '.gif')) return callBack(filepath + '.gif');
        if (fs.existsSync(filepath + '.png')) return callBack(filepath + '.png');

        const fallback = url.searchParams.get('fallback');
        return fallbackImage(projectPath, fallback, callBack);
      }
    } else if (!resourceType || resourceType === 'audio') {
      if (!fs.existsSync(filepath)) {
        const fallback = url.searchParams.get('fallback');
        if (fallback && fs.existsSync(fallback)) return callBack(fallback);
        return callBack(''); // no placeholder
      }
    }

    callBack(filepath);
  });
  // Create static files protocol
  protocol.registerFileProtocol('static', (request, callback) => {
    const fileUrl = request.url.replace('static://', '');
    const filePath = path.join(app.getAppPath(), electronIsDev ? '' : '.vite/renderer', fileUrl);
    callback({ path: filePath, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
};
