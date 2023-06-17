import { versionIntToString } from '@utils/versionIntToString';
import { IpcMainEvent, net } from 'electron';
import { getPSDKVersion, PSDK_DOWNLOADS_URL } from './getPSDKVersion';
import log from 'electron-log';

const returnGetLastVersionFailure = (event: IpcMainEvent) => {
  log.debug('Failed to get last version from internet');
  event.sender.send('get-last-psdk-version/result', getPSDKVersion());
};

const processAndSendLastVersion = (event: IpcMainEvent, data: string) => {
  const linkParts = data.split('/</a>');
  if (linkParts.length < 2) return returnGetLastVersionFailure(event);

  const linkPart = linkParts[linkParts.length - 2];
  const versionPart = linkPart.split('/">');
  if (versionPart.length === 0) return returnGetLastVersionFailure(event);

  sendLastVersionFromRemoteTextVersion(event, Number(versionPart[versionPart.length - 1]));
};

const sendLastVersionFromRemoteTextVersion = (event: IpcMainEvent, currentVersion: number) => {
  const request = net.request(`${PSDK_DOWNLOADS_URL}/${currentVersion}/version.txt`);
  let data = '';
  request.on('response', (response) => {
    response.on('end', () => {
      const version = Number(data.trim());
      event.sender.send('get-last-psdk-version/result', { int: version, string: versionIntToString(version) });
    });
    response.on('data', (chunk) => {
      data = data + chunk.toString('utf-8');
    });
  });
  request.on('error', (error) => {
    log.error('Error while trying to get last version', error);
    returnGetLastVersionFailure(event);
  });
  request.end();
};

export const getLastPSDKVersion = (event: IpcMainEvent): void => {
  if (!net.isOnline()) {
    returnGetLastVersionFailure(event);
    return;
  }
  const request = net.request(`${PSDK_DOWNLOADS_URL}/?v=${Date.now()}`);
  let data = '';
  request.on('response', (response) => {
    response.on('end', () => processAndSendLastVersion(event, data));
    response.on('data', (chunk) => {
      data = data + chunk.toString('utf-8');
    });
  });
  request.on('error', (error) => {
    log.error('Error while trying to get last version', error);
    returnGetLastVersionFailure(event);
  });
  request.end();
};
