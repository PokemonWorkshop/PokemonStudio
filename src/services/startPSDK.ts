import { spawn } from 'child_process';
import path from 'path';
import { generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import { writeFileSync, existsSync, readFileSync, renameSync } from 'fs';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `"${projectPath}/psdk.bat" ${args.join(' ')}`]];
  } else if (process.platform === 'linux') {
    return ['./game-linux.sh', args];
  } else {
    return ['./game.rb', args];
  }
};

export const RMXP2StudioSafetyNet = (projectPath: string) => {
  const psdkBatPath = path.join(projectPath, 'psdk.bat');
  const psdkBatContent = generatePSDKBatFileContent();
  const realPsdkBatContent = existsSync(psdkBatPath) && readFileSync(psdkBatPath).toString('utf-8');
  if (realPsdkBatContent !== psdkBatContent) writeFileSync(psdkBatPath, psdkBatContent);

  const gameRbPath = path.join(projectPath, 'Game.rb');
  const gameRbContent = readFileSync(path.join(getPSDKBinariesPath(), 'Game.rb')).toString('utf-8');
  const realgameRbContent = existsSync(gameRbPath) && readFileSync(gameRbPath).toString('utf-8');
  if (realgameRbContent !== gameRbContent) writeFileSync(gameRbPath, gameRbContent);

  const pokemonSDKFolder = path.join(projectPath, 'pokemonsdk');
  if (!existsSync(path.join(projectPath, '.git')) && existsSync(pokemonSDKFolder)) {
    renameSync(pokemonSDKFolder, path.join(projectPath, 'pokemonsdk.old'));
  }
};

export const startPSDK = (projectPath: string) => {
  RMXP2StudioSafetyNet(projectPath);
  const childProcess = spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true, detached: true, stdio: 'ignore' });
  childProcess.unref();
};

const startPSDKWithArgs = (projectPath: string, ...args: string[]) => {
  RMXP2StudioSafetyNet(projectPath);
  const childProcess = spawn(...getSpawnArgs(projectPath, ...args), { cwd: projectPath, shell: true, detached: true, stdio: 'ignore' });
  childProcess.unref();
};

export const startPSDKDebug = (projectPath: string) => startPSDKWithArgs(projectPath, 'debug');
export const startPSDKTags = (projectPath: string) => startPSDKWithArgs(projectPath, '--tags');
export const startPSDKWorldmap = (projectPath: string) => startPSDKWithArgs(projectPath, '--worldmap');
