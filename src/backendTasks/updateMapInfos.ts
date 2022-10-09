import { getSpawnArgs, RMXP2StudioSafetyNet } from '@services/PSDKIPC/psdk.exec.channel.service';
import { spawn } from 'child_process';
import Electron, { IpcMainEvent } from 'electron';
import log from 'electron-log';

const getChildProcess = (projectPath: string) => {
  try {
    RMXP2StudioSafetyNet(projectPath);
    return spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true });
  } catch (error) {
    throw new Error(`Failed to update Map Infos: ${error instanceof Error ? error.message : error}`);
  }
};

const execUpdateMapInfos = async (_: IpcMainEvent, projectPath: string) => {
  if (process.platform !== 'win32') return new Promise<void>((resolve) => resolve());
  const childProcess = getChildProcess(projectPath);
  const stdData = { out: '', err: '' };
  return new Promise<void>((resolve, reject) => {
    let rejectReason: string | undefined = undefined;
    let didTheJob = false;
    childProcess.stdin.write('{"action":"updateMapInfosToStudio"}\n{"action":"exit"}\n');

    childProcess.stderr.on('data', (data) => {
      log.warn('update-map-infos.stderr.data', data.toString());
      const arrData = (stdData.err + data.toString()).split('\n');
      stdData.err = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
      if (arrData.length > 0) {
        rejectReason = rejectReason ? [rejectReason, ...arrData].join('\n') : arrData.join('\n');
        childProcess.stdin.write('{"action":"exit"}\n');
      }
    });

    childProcess.stdout.on('data', (data) => {
      log.info('update-map-infos.stdout.data', data.toString());
      const arrData = (stdData.out + data.toString()).split('\n');
      stdData.out = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
      arrData.forEach((line) => {
        if (line.trim() === '{"done":true,"message":"Map infos conversion to Studio done!"}') {
          didTheJob = true;
        }
      });
    });

    childProcess.on('exit', (code) => {
      log.info('update-map-infos.exit', code);
      if (rejectReason) reject(rejectReason);
      else if (!didTheJob) reject('update-map-infos did not updated the data as expected. Please check your PSDK version.');
      else if (code === 0) resolve();
      else reject(`update-map-infos exited with code ${code}`);
    });
  });
};

const updateMapInfos = async (event: IpcMainEvent, payload: { projectPath: string }) => {
  log.info('update-map-infos', payload);
  try {
    await execUpdateMapInfos(event, payload.projectPath);
    log.info('update-map-infos/success');
    event.sender.send('update-map-infos/success', {});
  } catch (error) {
    log.error('update-map-infos/failure', error);
    event.sender.send('update-map-infos/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerUpdateMapInfos = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('update-map-infos', updateMapInfos);
};
