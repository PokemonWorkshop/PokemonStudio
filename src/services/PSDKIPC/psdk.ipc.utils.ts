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
