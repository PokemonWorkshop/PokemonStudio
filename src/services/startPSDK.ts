import { generateGameLinuxFileContent, generateGameMacFileContent, generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';
import { spawn } from 'child_process';
import log from 'electron-log';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', 'psdk.bat', ...args]];
  } else if (process.platform === 'linux') {
    if (existsSync('/usr/bin/gnome-terminal')) {
      return ['gnome-terminal', ['--', './game-linux.sh', ...args]];
    }
    if (existsSync('/usr/bin/konsole')) {
      return ['konsole', ['-e', './game-linux.sh', ...args]];
    }
    if (existsSync('/usr/bin/xterm')) {
      return ['xterm', ['-e', `bash -c "./game-linux.sh ${args.join(' ')}; exec bash"`]];
    }
    log.warn('No terminal found. The PSDK console will not be displayed.');
    return ['./game-linux.sh', args];
  } else if (process.platform === 'darwin') {
    return [
      'osascript',
      [
        '-e',
        `tell application "Terminal"
          do script "cd '${projectPath}' && ./game-mac.sh ${args.join(' ')}"
          activate
        end tell`,
      ],
    ];
  } else {
    return ['./game.rb', args];
  }
};

const bootLoadFilename = () => {
  if (process.platform === 'darwin') return 'game-mac.sh';
  if (process.platform === 'linux') return 'game-linux.sh';
  return 'psdk.bat';
};

const generateBootLoadContent = (projectPath: string) => {
  if (process.platform === 'darwin') return generateGameMacFileContent(projectPath);
  if (process.platform === 'linux') return generateGameLinuxFileContent(projectPath);
  return generatePSDKBatFileContent();
};

export const ensureBootLoadFile = (projectPath: string) => {
  const psdkBatPath = path.join(projectPath, bootLoadFilename());
  const psdkBatContent = generateBootLoadContent(projectPath);
  const realPsdkBatContent = existsSync(psdkBatPath) && readFileSync(psdkBatPath).toString('utf-8');
  if (realPsdkBatContent !== psdkBatContent) writeFileSync(psdkBatPath, psdkBatContent);

  if (process.platform !== 'win32') chmodSync(psdkBatPath, 0o755);

  const gameRbPath = path.join(projectPath, 'Game.rb');
  const gameRbContent = readFileSync(path.join(getPSDKBinariesPath(), 'Game.rb')).toString('utf-8');
  const realgameRbContent = existsSync(gameRbPath) && readFileSync(gameRbPath).toString('utf-8');
  if (realgameRbContent !== gameRbContent) writeFileSync(gameRbPath, gameRbContent);
};

// To prevent multiple launches of PSDK (delay 250 ms)
let lastDatePSDKLaunch = 0;
const canLaunchPSDK = () => {
  const now = Date.now();
  if (now > lastDatePSDKLaunch + 250) {
    lastDatePSDKLaunch = now;
    return true;
  }
  return false;
};

const childProcessFn = (projectPath: string, command: string, spawnArgs: string[]) => {
  const isMac = process.platform === 'darwin';
  const childProcess = spawn(command, spawnArgs, {
    cwd: projectPath,
    shell: !isMac,
    detached: !isMac,
    stdio: isMac ? 'inherit' : 'ignore',
  });
  if (!isMac) childProcess.unref();
};

export const startPSDK = (projectPath: string) => {
  if (!canLaunchPSDK()) return;

  ensureBootLoadFile(projectPath);

  const studioPath = process.cwd();
  try {
    process.chdir(projectPath);

    const [command, spawnArgs] = getSpawnArgs(projectPath);

    childProcessFn(projectPath, command, spawnArgs);
  } finally {
    process.chdir(studioPath);
  }
};

const startPSDKWithArgs = (projectPath: string, ...args: string[]) => {
  if (!canLaunchPSDK()) return;

  ensureBootLoadFile(projectPath);

  const studioPath = process.cwd();
  try {
    process.chdir(projectPath);

    const [command, spawnArgs] = getSpawnArgs(projectPath, ...args);

    childProcessFn(projectPath, command, spawnArgs);
  } finally {
    process.chdir(studioPath);
  }
};

export const startPSDKDebug = (projectPath: string) => startPSDKWithArgs(projectPath, 'debug');
export const startPSDKWorldmap = (projectPath: string) => startPSDKWithArgs(projectPath, '--worldmap');
