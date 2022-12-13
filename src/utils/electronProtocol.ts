import { protocol } from 'electron';
import path from 'path';
import fs from 'fs';

const FALLBACK_IMAGE = 'icons/navigation/help-icon.svg';

export const registerElectronProtocolWhenAppRead = (resourcePath: string) => {
  protocol.registerFileProtocol('project', (request, callBack) => {
    const url = new URL(request.url);
    const projectPath = url.searchParams.get('projectPath');
    if (!projectPath) return callBack(path.join(resourcePath, FALLBACK_IMAGE));

    const filepath = path.join(projectPath, url.pathname);
    if (!fs.existsSync(filepath)) {
      const fallback = url.searchParams.get('fallback');
      if (fallback && fs.existsSync(fallback)) return callBack(fallback);
      return callBack(path.join(resourcePath, FALLBACK_IMAGE));
    }

    callBack(filepath);
  });
};
