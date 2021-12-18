import { ChannelResponseFunctionType, PSDKIpcService } from './psdk.ipc.service';

export type StartPSDKResponseFunctions = {
  'psdk-exec.exit'?: (code: number) => void;
  'psdk-exec.stdout.data'?: (data: string) => void;
  'psdk-exec.stderr.data'?: (data: string) => void;
};

export const startPSDK = (Ipc: PSDKIpcService, projectPath: string, responseFunctions: StartPSDKResponseFunctions) =>
  Ipc.send({
    type: 'multi-channel',
    args: [projectPath],
    requestChannel: 'psdk-exec',
    responseFunctions: responseFunctions as Record<string, ChannelResponseFunctionType>,
  });

export const execCommandInPSDK = (Ipc: PSDKIpcService, projectPath: string, command: string, onError: (jsonError: string) => void) =>
  Ipc.send({
    type: 'single-channel',
    args: [projectPath, 'stdin.write', command],
    requestChannel: 'psdk-exec',
    responseChannel: 'psdk-exec.stdin.error',
    responseFunction: (jsonError) => typeof jsonError === 'string' && onError(jsonError),
  });

export const isPSDKRunning = (Ipc: PSDKIpcService, responseFunction: (isRunning: boolean) => void) =>
  Ipc.send({
    type: 'single-channel',
    args: ['any', 'isRunning'],
    requestChannel: 'psdk-exec',
    responseChannel: 'psdk-exec.isRunning',
    responseFunction: responseFunction as ChannelResponseFunctionType,
  });

/**
 * Decode the mega_script.deflate downloaded from the PSDK updates
 * @note If it succeed, the promise resolve has a field `data` holding a Record of filename to file data
 * @example // Decode downloaded scripts from disk:
 *  decodeDownloadedScripts(ipc, 'mega_script.deflate')
 *    .then(({ data }) => console.log(data['pokemonsdk/scripts/filename.rb']))
 *    .catch(({ error }) => console.error(error)))
 * @example // Decode downloaded script from data received via fetch
 *  decodeDownloadedScripts(ipc, response.body, true)
 *    .then(({ data }) => console.log(data['pokemonsdk/scripts/filename.rb']))
 *    .catch(({ error }) => console.error(error)))
 */
export const decodeDownloadedScripts = (Ipc: PSDKIpcService, scriptPath: string, fromMemory = false) => {
  return new Promise<Record<string, string>>((resolve, reject) => {
    const responseFunction = (jsonResponse: string) => {
      const response = JSON.parse(jsonResponse);
      if (response.error) {
        reject(response);
      } else {
        resolve(response);
      }
    };

    Ipc.send({
      type: 'single-channel',
      args: [scriptPath, fromMemory],
      requestChannel: 'psdk-decode-downloaded-scripts',
      responseChannel: 'psdk-decode-downloaded-scripts.result',
      responseFunction: responseFunction as ChannelResponseFunctionType,
    });
  });
};
