import { app, protocol } from 'electron';
import electronIsDev from 'electron-is-dev';
import path from 'path';
import fs from 'fs';
import querystring from 'querystring';

const FALLBACK_IMAGE = 'icons/navigation/help-icon.svg';

export const registerElectronProtocolWhenAppRead = (resourcePath: string) => {
  protocol.registerFileProtocol('project', (request, callBack) => {
    const url = new URL(request.url);
    const projectPath = url.searchParams.get('projectPath');
    if (!projectPath) return callBack(path.join(resourcePath, FALLBACK_IMAGE));

    const resourceType = url.searchParams.get('type');
    const filepath = path.join(projectPath, querystring.unescape(url.pathname));
    if (resourceType === 'image') {
      const isExtension = filepath.endsWith('.png') || filepath.endsWith('.gif');
      if (isExtension) {
        if (!fs.existsSync(filepath)) {
          const fallback = url.searchParams.get('fallback');
          if (fallback && fs.existsSync(fallback)) return callBack(fallback);
          return callBack(path.join(resourcePath, FALLBACK_IMAGE));
        }
      } else {
        if (fs.existsSync(filepath + '.gif')) return callBack(filepath + '.gif');
        if (fs.existsSync(filepath + '.png')) return callBack(filepath + '.png');
        const fallback = url.searchParams.get('fallback');
        if (fallback && fs.existsSync(fallback + '.gif')) return callBack(fallback + '.gif');
        if (fallback && fs.existsSync(fallback + '.png')) return callBack(fallback + '.png');
        return callBack(path.join(resourcePath, FALLBACK_IMAGE));
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
    const filePath = path.join(app.getAppPath(), electronIsDev ? '' : '.webpack/renderer', fileUrl);
    callback({ path: filePath, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
};
