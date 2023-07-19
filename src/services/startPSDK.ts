import { spawn } from 'child_process';
import path from 'path';
import { generateGameMacFileContent, generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import { writeFileSync, existsSync, readFileSync, renameSync, chmodSync } from 'fs';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `"${projectPath}/psdk.bat" ${args.join(' ')}`]];
  } else if (process.platform === 'linux') {
    return ['./game-linux.sh', args];
  } else if (process.platform === 'darwin') {
    // TODO: figure out how to display the console :v
    return ['./game-mac.sh', args];
  } else {
    return ['./game.rb', args];
  }
};

const bootLoadFilename = process.platform === 'darwin' ? 'game-mac.sh' : 'psdk.bat';
const generateBootLoadContent = (projectPath: string) =>
  process.platform === 'darwin' ? generateGameMacFileContent(projectPath) : generatePSDKBatFileContent();

export const RMXP2StudioSafetyNet = (projectPath: string) => {
  const psdkBatPath = path.join(projectPath, bootLoadFilename);
  const psdkBatContent = generateBootLoadContent(projectPath);
  const realPsdkBatContent = existsSync(psdkBatPath) && readFileSync(psdkBatPath).toString('utf-8');
  if (realPsdkBatContent !== psdkBatContent) writeFileSync(psdkBatPath, psdkBatContent);
  // eslint-disable-next-line no-octal
  if (process.platform !== 'win32') chmodSync(psdkBatPath, 0o755);

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
