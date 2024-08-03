import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { StudioCompilation } from '@components/compilation/CompilationDialogSchema';
import { IpcMainEvent } from 'electron';
import { ChannelNames, sendProgress } from '@utils/BackendTask';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';
import { INFO_CONFIG_VALIDATOR } from '@modelEntities/config';
import { parseJSON } from '@utils/json/parse';
import { PROJECT_VALIDATOR } from '@modelEntities/project';
import { RMXP2StudioSafetyNet } from '@services/startPSDK';
import windowManager from './windowManager';
import { existsSync } from 'fs';
import fsPromise from 'fs/promises';
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
let isError = false;

const getSpawnArgs = (rubyPath: string, projectPath: string, ...args: string[]): [string, string[]] => {
  RMXP2StudioSafetyNet(projectPath);
  if (process.platform === 'win32') {
    const gamePath = path.join(projectPath, 'Game.rb');
    return [path.join(rubyPath, 'rubyw.exe'), ['--disable=gems,rubyopt,did_you_mean', gamePath, ...args]];
  } else if (process.platform === 'linux') {
    return ['./game-linux.sh', ['--disable=gems,rubyopt,did_you_mean', ...args]];
  } else {
    return ['./game-mac.sh', args];
  }
};

const getCompilationArgs = (configuration: StudioCompilation) => {
  const args = ['--util=project_compilation'];
  if (!configuration.updateAudio) args.push('skip_audio');
  if (!configuration.updateBinaries) args.push('skip_binary');
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
  isError = false;
};

const updateInfosConfig = async (infosConfigPath: string, configuration: StudioCompilation) => {
  if (!existsSync(infosConfigPath)) throw new Error('infos_config.json file not found');

  const infosConfigContent = (await fsPromise.readFile(infosConfigPath)).toString('utf-8');
  const infosConfig = INFO_CONFIG_VALIDATOR.safeParse(parseJSON(infosConfigContent, 'infos_config.json'));
  if (!infosConfig.success) throw new Error('Fail to parse infos_config.json');

  infosConfig.data.gameTitle = configuration.gameName;
  infosConfig.data.gameVersion = configuration.gameVersion;
  await fsPromise.writeFile(infosConfigPath, JSON.stringify(infosConfig.data, null, 2));
};

const updateProjectStudio = async (projectStudioFilePath: string, configuration: StudioCompilation) => {
  if (!existsSync(projectStudioFilePath)) throw new Error('project.studio file not found');

  const projectStudioContent = (await fsPromise.readFile(projectStudioFilePath)).toString('utf-8');
  const projectStudio = PROJECT_VALIDATOR.safeParse(parseJSON(projectStudioContent, 'project.studio'));
  if (!projectStudio.success) throw new Error('Fail to parse project.studio');

  projectStudio.data.title = configuration.gameName;
  await fsPromise.writeFile(projectStudioFilePath, JSON.stringify(projectStudio.data, null, 2));
};

const compilationProcess = async (event: IpcMainEvent, channels: ChannelNames, configuration: StudioCompilation): Promise<number> => {
  const windowCompilation = windowManager.getWindow('compilation');
  if (!windowCompilation) throw new Error('The compilation window does not exist');

  windowCompilation.on('closed', () => {
    if (!childProcess) return;

    log.warn('Compilation process was interrupted because the window has been closed');
    childProcess?.removeAllListeners('exit');
    childProcess?.kill();
    clearChildProcess();
  });

  return new Promise((resolve, reject) => {
    const psdkBinaries = `${getPSDKBinariesPath()}/`;
    const projectPath = configuration.projectPath;

    if (childProcess && childProcess.exitCode === null) {
      reject();
    }

    childProcess = spawn(...getSpawnArgs(psdkBinaries, projectPath, ...getCompilationArgs(configuration)), {
      cwd: projectPath,
      env: { ...process.env, PSDK_BINARY_PATH: psdkBinaries },
    });

    childProcess.stderr.on('data', (chunk) => {
      loggerBuffer.push(chunk);
      isError = true;
    });

    childProcess.stdout.on('data', (chunk) => {
      const arrData = (stdOutRemaining + chunk.toString()).split('\n');
      stdOutRemaining = arrData.pop() || '';
      // Handle progress
      arrData.forEach((rawLine) => {
        // Remove colors
        // eslint-disable-next-line no-control-regex
        const line = rawLine.replaceAll(/\x1b\[\d{1,2}m/g, '').replaceAll(/^\r/g, '');
        if (line.startsWith('Progress:')) {
          progression += 1;
        } else {
          loggerBuffer.push(process.platform === 'win32' ? line : `${line}\n`);
          if (loggerBuffer.length >= BUFFER_LIMIT) {
            sendProgress(event, channels, { step: progression, total: 0, stepText: getLoggerBuffer() });
          }
        }
      });
    });

    childProcess.on('exit', () => {
      sendProgress(event, channels, { step: progression, total: 0, stepText: getLoggerBuffer() });
      resolve(isError ? 1 : 0);
      clearChildProcess();
    });

    childProcess.on('error', (error) => {
      clearChildProcess();
      reject(error);
    });
  });
};

const startCompilation = async (payload: StartCompilationInput, event: IpcMainEvent, channels: ChannelNames): Promise<StartCompilationOutput> => {
  log.info('start-compilation', payload);

  const configuration = payload.configuration;
  updateInfosConfig(path.join(configuration.projectPath, 'Data/configs/infos_config.json'), configuration);
  updateProjectStudio(path.join(configuration.projectPath, 'project.studio'), configuration);

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
