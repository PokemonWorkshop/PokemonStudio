import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { StudioCompilation } from '@components/compilation/CompilationDialogSchema';
import { IpcMainEvent } from 'electron';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';
import path from 'path';
import log from 'electron-log';

export type StartCompilationInput = {
  configuration: StudioCompilation;
};
export type StartCompilationOutput = {
  exitCode: number;
};

let childProcess: ChildProcessWithoutNullStreams | undefined = undefined;
let stdOutRemaining = '';
let loggerBuffer: string[] = [];
const BUFFER_LIMIT = 10; // The data is send to the front-end when the loggerBuffer reaches or exceeds the limit
let progression = 0;

const getSpawnArgs = (rubyPath: string, projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    const gamePath = path.join(projectPath, 'Game.rb');
    return [path.join(rubyPath, 'rubyw.exe'), ['--disable=gems,rubyopt,did_you_mean', gamePath, ...args]];
  } else if (process.platform === 'linux') {
    return [path.join(rubyPath, 'game-linux.sh'), [`${args.join(' ')}`]];
  } else {
    return [path.join(rubyPath, 'game.rb'), [`${args.join(' ')}`]];
  }
};

const getCompilationArgs = (configuration: StudioCompilation) => {
  const args = ['--util=project_compilation'];
  if (!configuration.updateAudio) args.push('skip_audio');
  if (!configuration.updateBinaries) args.push('skip_binary');
  if (!configuration.updateData) args.push('skip_data');
  if (!configuration.updateLibraries) args.push('skip_lib');
  if (!configuration.updateVisual) args.push('skip_graphics');
  return args;
};

const getLoggerBuffer = () => {
  const logs = loggerBuffer.join('');
  loggerBuffer = [];
  return logs;
};

const clearChildProcess = () => {
  childProcess?.stdout.removeAllListeners();
  childProcess?.unref();
  childProcess = undefined;
  stdOutRemaining = '';
  progression = 0;
};

const compilationProcess = async (event: IpcMainEvent, channels: ChannelNames, configuration: StudioCompilation): Promise<number> => {
  clearChildProcess();

  return new Promise((resolve, reject) => {
    if (childProcess && childProcess.exitCode === null) {
      reject();
    }

    const psdkBinaries = `${getPSDKBinariesPath()}/`;
    const projectPath = configuration.projectPath;
    childProcess = spawn(...getSpawnArgs(psdkBinaries, projectPath, ...getCompilationArgs(configuration)), {
      cwd: projectPath,
      env: { ...process.env, PSDK_BINARY_PATH: psdkBinaries },
    });

    childProcess.stderr.on('data', (chunk) => {
      sendProgress(event, channels, { step: progression, total: 0, stepText: getLoggerBuffer() });
      sendProgress(event, channels, { step: progression, total: 0, stepText: chunk.toString() });
      resolve(1);
    });

    childProcess.stdout.on('data', (chunk) => {
      const arrData = (stdOutRemaining + chunk.toString()).split('\n');
      stdOutRemaining = arrData.pop() || '';
      // Handle progress
      arrData.forEach((line) => {
        if (line.startsWith('Progress:')) {
          progression += 1;
        } else {
          // eslint-disable-next-line no-control-regex
          const lineWithoutColor = line.replaceAll(/\x1b\[\d{1,2}m/g, '').replaceAll(/^\r/g, '');
          loggerBuffer.push(lineWithoutColor);
          if (loggerBuffer.length >= BUFFER_LIMIT) {
            sendProgress(event, channels, { step: progression, total: 0, stepText: getLoggerBuffer() });
          }
        }
      });
      // Handle process disconnection
      if (arrData.some((line) => line.startsWith('Compilation done!'))) {
        sendProgress(event, channels, { step: ++progression, total: 0, stepText: getLoggerBuffer() });
        resolve(0);
      }
    });

    childProcess.on('exit', () => clearChildProcess());

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
};

const startCompilation = async (payload: StartCompilationInput, event: IpcMainEvent, channels: ChannelNames): Promise<StartCompilationOutput> => {
  log.info('start-compilation', payload);
  let exitCode = 0;

  await compilationProcess(event, channels, payload.configuration)
    .then((code) => {
      log.info('start-compilation/exit-code', code);
      exitCode = code;
    })
    .catch((error) => {
      log.error('start-compilation/exit-error', error);
      exitCode = 1;
    });

  return { exitCode };
};

export const registerStartCompilation = defineBackendServiceFunction('start-compilation', startCompilation);
