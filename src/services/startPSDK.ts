import { spawn } from 'child_process';
import { RMXP2StudioSafetyNet } from './PSDKIPC/psdk.exec.channel.service';

export const getSpawnArgs = (projectPath: string, ...args: string[]): [string, string[]] => {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/c', `"${projectPath}/psdk.bat" ${args.join(' ')}`]];
  } else if (process.platform === 'linux') {
    return ['./game-linux.sh', args];
  } else {
    return ['./game.rb', args];
  }
};

export const startPSDK = (projectPath: string) => {
  RMXP2StudioSafetyNet(projectPath);
  const childProcess = spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true, detached: true, stdio: 'ignore' });
  childProcess.unref();
};
