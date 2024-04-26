import { spawn } from 'child_process';
import path from 'path';
import { generateGameLinuxFileContent, generateGameMacFileContent, generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import { writeFileSync, existsSync, readFileSync, chmodSync } from 'fs';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';
import log from 'electron-log';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `"${projectPath}/psdk.bat" ${args.join(' ')}`]];
  } else if (process.platform === 'linux') {
    const linuxArgs = ['-e', `"${projectPath.replaceAll(' ', '\\ ')}/game-linux.sh ${args.join(' ')}"`];
    if (existsSync('/usr/bin/gnome-terminal')) {
      return ['gnome-terminal', linuxArgs];
    }
    if (existsSync('/usr/bin/konsole')) {
      return ['konsole', linuxArgs];
    }
    log.info('No terminal found. The PSDK console will not be displayed.');
    return ['./game-linux.sh', args];
  } else if (process.platform === 'darwin') {
    // TODO: figure out how to display the console :v
    return ['./game-mac.sh', args];
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

export const RMXP2StudioSafetyNet = (projectPath: string) => {
  const psdkBatPath = path.join(projectPath, bootLoadFilename());
  const psdkBatContent = generateBootLoadContent(projectPath);
  const realPsdkBatContent = existsSync(psdkBatPath) && readFileSync(psdkBatPath).toString('utf-8');
  if (realPsdkBatContent !== psdkBatContent) writeFileSync(psdkBatPath, psdkBatContent);
  // eslint-disable-next-line no-octal
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

export const startPSDK = (projectPath: string) => {
  if (!canLaunchPSDK()) return;

  RMXP2StudioSafetyNet(projectPath);
  const childProcess = spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true, detached: true, stdio: 'ignore' });
  childProcess.unref();
};

const startPSDKWithArgs = (projectPath: string, ...args: string[]) => {
  if (!canLaunchPSDK()) return;

  RMXP2StudioSafetyNet(projectPath);
  const childProcess = spawn(...getSpawnArgs(projectPath, ...args), { cwd: projectPath, shell: true, detached: true, stdio: 'ignore' });
  childProcess.unref();
};

export const startPSDKDebug = (projectPath: string) => startPSDKWithArgs(projectPath, 'debug');
export const startPSDKTags = (projectPath: string) => startPSDKWithArgs(projectPath, '--tags');
export const startPSDKWorldmap = (projectPath: string) => startPSDKWithArgs(projectPath, '--worldmap');
