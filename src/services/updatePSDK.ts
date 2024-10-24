import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { versionIntToString } from '@utils/versionIntToString';
import { net, IpcMainEvent } from 'electron';
import { getPSDKBinariesPath, PSDK_DOWNLOADS_URL } from './getPSDKVersion';
import { Marshal, isMarshalHash } from 'ts-marshal';
import log from 'electron-log';

const getNextVersion = (version: number): Promise<number | undefined> => {
  return new Promise((resolve, reject) => {
    const request = net.request(`${PSDK_DOWNLOADS_URL}/${version}/version.txt?v=${(Date.now() / 3600_000).toFixed()}`);
    let data = '';
    request.on('response', (response) => {
      if (response.statusCode !== 200) return resolve(undefined);

      response.on('end', () => resolve(Number(data.trim())));
      response.on('data', (chunk) => {
        data = data + chunk.toString('utf-8');
      });
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end();
  });
};

const getNextVersions = async (currentVersion: number): Promise<number[]> => {
  const nextVersion = await getNextVersion(currentVersion);
  if (!nextVersion) return [];

  return [nextVersion, ...(await getNextVersions(nextVersion))];
};

const getFileIndex = (version: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = net.request(`${PSDK_DOWNLOADS_URL}/${version}/file_index.txt?v=${(Date.now() / 3600_000).toFixed()}`);
    let data = '';
    request.on('response', (response) => {
      if (response.statusCode !== 200) return resolve(`Invalid status code for file_index.txt file ${response.statusCode}`);

      response.on('end', () => resolve(data));
      response.on('data', (chunk) => {
        data = data + chunk.toString('utf-8');
      });
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end();
  });
};

const filesToDownload = (fileIndexData: string) => {
  const filesToDownload = { scriptLoad: false, megaScript: false };
  fileIndexData.split('\n').forEach((line) => {
    filesToDownload.scriptLoad ||= line.startsWith('ScriptLoad.rb:');
    filesToDownload.megaScript ||= line.startsWith('mega_script.deflate:');
  });
  return filesToDownload;
};

const downloadScripts = async (version: number, type: 'megaScript' | 'scriptLoad'): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const resource = type === 'megaScript' ? 'mega_script.deflate' : 'ScriptLoad.rb';
    const request = net.request(`${PSDK_DOWNLOADS_URL}/${version}/${resource}?v=${(Date.now() / 3600_000).toFixed()}`);
    let data = Buffer.alloc(0);
    request.on('response', (response) => {
      if (response.statusCode !== 200) return reject(`Invalid status code for ${resource} ${response.statusCode}`);

      response.on('end', () => resolve(data));
      response.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end();
  });

const downloadAndInstallMegaScript = async (version: number): Promise<void> => {
  const megaDeflate = await downloadScripts(version, 'megaScript');
  const data = zlib.inflateSync(megaDeflate);
  const marshalData = Marshal.load(data);
  if (!isMarshalHash(marshalData)) throw new Error('Downloaded data is not Hash object');

  const { __class, __default, __extendedModules, ...scripts } = marshalData;
  const binariesPath = getPSDKBinariesPath();
  Object.entries(scripts).forEach(([filename, fileData]) => {
    if (typeof fileData !== 'string') return;

    const realFilename = path.join(binariesPath, filename);
    const dirname = path.dirname(realFilename);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

    fs.writeFileSync(realFilename, fileData);
  });
};

const downloadAndInstallScriptLoad = async (version: number): Promise<void> => {
  const scriptLoader = await downloadScripts(version, 'scriptLoad');
  const fileData = scriptLoader.toString('utf-8');
  const filename = path.join(getPSDKBinariesPath(), 'pokemonsdk/scripts/ScriptLoad.rb');
  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

  fs.writeFileSync(filename, fileData);
};

export const updatePSDK = async (event: IpcMainEvent, currentVersion: number) => {
  try {
    const versions = await getNextVersions(currentVersion);
    if (versions.length === 0) return event.sender.send('update-psdk/done', true);

    const sourceVersion = [currentVersion, ...versions.slice(0, -1)];
    await versions.reduce(async (prev, curr, index) => {
      await prev;
      event.sender.send('update-psdk/status', index + 1, versions.length, { int: curr, string: versionIntToString(curr) });
      const version = sourceVersion[index];
      const fileIndexData = await getFileIndex(version);
      const { scriptLoad, megaScript } = filesToDownload(fileIndexData);
      if (megaScript) await downloadAndInstallMegaScript(version);
      if (scriptLoad) await downloadAndInstallScriptLoad(version);
    }, Promise.resolve());

    fs.writeFileSync(path.join(getPSDKBinariesPath(), 'pokemonsdk/version.txt'), versions[versions.length - 1].toString());
    event.sender.send('update-psdk/done', true);
  } catch (e) {
    log.error(e);
    event.sender.send('update-psdk/done', false);
  }
};
