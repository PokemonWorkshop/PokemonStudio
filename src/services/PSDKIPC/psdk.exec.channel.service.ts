import { generatePSDKBatFileContent } from '@services/generatePSDKBatFileContent';
import { getPSDKBinariesPath } from '@services/getPSDKVersion';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { IpcMainEvent } from 'electron';
import { writeFileSync, existsSync, readFileSync, renameSync } from 'fs';
import path from 'path';
import { PSDKAbstractIpcChannel } from './psdk.abstract.ipc.channel';
import log from 'electron-log';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  const finalArguments = ['studio'].concat(args);
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `"${projectPath}/psdk.bat" ${finalArguments.join(' ')}`]];
  } else if (process.platform === 'linux') {
    return ['./game-linux.sh', finalArguments];
  } else {
    return ['./game.rb', finalArguments];
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

/**
 *  Example of service that giving the current time
 */
export class PSDKExecChannelService extends PSDKAbstractIpcChannel {
  channelName = 'psdk-exec';

  private childProcess?: ChildProcessWithoutNullStreams;

  // Data remaining from stdout
  private outRemaining = '';

  // Data remaining from stderr
  private errRemaining = '';

  handle(event: IpcMainEvent, projectPath: string, ...args: unknown[]): void {
    log.info('psdk-exec', projectPath, args);
    if (args.length !== 0 && args[0] === 'isRunning') {
      return event.sender.send('psdk-exec.isRunning', !!(this.childProcess && this.childProcess.exitCode === null));
    }

    if (!this.childProcess || this.childProcess.exitCode !== null) {
      try {
        RMXP2StudioSafetyNet(projectPath);
        this.childProcess = spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true });
      } catch (error) {
        log.error('Failed to start or prepare PSDK', error);
        event.sender.send('psdk-exec.exit', -1);
        return;
      }
      this.outRemaining = '';
      this.errRemaining = '';

      this.childProcess.stderr.on('data', (data) => {
        log.warn('psdk-exec.stderr.data', data.toString());
        const arrData = (this.errRemaining + data.toString()).split('\n');
        this.errRemaining = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
        arrData.forEach((line) => event.sender.send('psdk-exec.stderr.data', JSON.stringify({ message: line.toString() })));
      });
      this.childProcess.stdout.on('data', (data) => {
        log.info('psdk-exec.stdout.data', data.toString());
        const arrData = (this.outRemaining + data.toString()).split('\n');
        this.outRemaining = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
        arrData.forEach((line) => event.sender.send('psdk-exec.stdout.data', line.toString()));
      });
      this.childProcess.on('exit', (code) => {
        log.info('psdk-exec.exit', code);
        event.sender.send('psdk-exec.exit', code);
        this.childProcess = undefined;
      });
    }

    if (args.length !== 0 && args[0] === 'stdin.write' && typeof args[1] === 'string') {
      this.childProcess.stdin.write(args[1], (error) => {
        if (error) {
          log.warn('psdk-exec.stdin.error', error);
          event.sender.send('psdk-exec.stdin.error', JSON.stringify({ klass: error.name, message: error.message }));
        }
      });
      return;
    }
  }
}
