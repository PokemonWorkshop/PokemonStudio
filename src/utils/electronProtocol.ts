import { protocol } from 'electron';
import path from 'path';
import fs from 'fs';

const FALLBACK_IMAGE = 'icons/navigation/help-icon.svg';

export const registerElectronProtocolWhenAppRead = (resourcePath: string) => {
  protocol.registerFileProtocol('project', (request, callBack) => {
    const url = new URL(request.url);
    const projectPath = url.searchParams.get('projectPath');
    if (!projectPath) return callBack(path.join(resourcePath, FALLBACK_IMAGE));

    const resourceType = url.searchParams.get('type');
    const filepath = path.join(projectPath, url.pathname);
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
};
