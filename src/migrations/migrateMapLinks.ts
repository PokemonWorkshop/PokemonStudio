import { getSpawnArgs, RMXP2StudioSafetyNet } from '@services/PSDKIPC/psdk.exec.channel.service';
import { spawn } from 'child_process';
import { IpcMainEvent } from 'electron';
import fs from 'fs';
import log from 'electron-log';
import path from 'path';

const getChildProcess = (projectPath: string) => {
  try {
    RMXP2StudioSafetyNet(projectPath);
    return spawn(...getSpawnArgs(projectPath), { cwd: projectPath, shell: true });
  } catch (error) {
    throw new Error(`Failed to migrate MapLinks: ${error instanceof Error ? error.message : error}`);
  }
};

const migrateMapLinksNonWindows = (projectPath: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      fs.writeFileSync(path.join(projectPath, 'Data', 'Studio', 'rmxp_maps.json'), `[{"id": 14,"name": "PSDK .25.0"}]`);
      fs.writeFileSync(
        path.join(projectPath, 'Data', 'Studio', 'maplinks', 'maplink_0.json'),
        `{
          "klass": "MapLink",
          "id": 0,
          "dbSymbol": "maplink_0",
          "mapId": 14,
          "northMaps": [
          ],
          "eastMaps": [
          ],
          "southMaps": [
          ],
          "westMaps": [
          ]
        }`
      );
    } catch (error) {
      reject(error instanceof Error ? error.message : JSON.stringify(error));
    }
    resolve();
  });
};

const deletePSDKDatFile = (projectPath: string) => {
  const psdkDatFilePath = path.join(projectPath, 'Data', 'Studio', 'psdk.dat');
  if (fs.existsSync(psdkDatFilePath)) fs.unlinkSync(psdkDatFilePath);
};

export const migrateMapLinks = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);
  if (process.platform !== 'win32') return migrateMapLinksNonWindows(projectPath);
  const childProcess = getChildProcess(projectPath);
  const stdData = { out: '', err: '' };
  return new Promise<void>((resolve, reject) => {
    let rejectReason: string | undefined = undefined;
    let didTheJob = false;
    childProcess.stdin.write('{"action":"importMapInfosToStudio"}\n{"action":"exit"}\n');

    childProcess.stderr.on('data', (data) => {
      log.warn('migrate-maplinks.stderr.data', data.toString());
      const arrData = (stdData.err + data.toString()).split('\n');
      stdData.err = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
      if (arrData.length > 0) {
        rejectReason = rejectReason ? [rejectReason, ...arrData].join('\n') : arrData.join('\n');
        childProcess.stdin.write('{"action":"exit"}\n');
      }
    });

    childProcess.stdout.on('data', (data) => {
      log.info('migrate-maplinks.stdout.data', data.toString());
      const arrData = (stdData.out + data.toString()).split('\n');
      stdData.out = arrData.pop() || ''; // All message ends with \n, so if something remains, we have something, otherwise we have empty string
      arrData.forEach((line) => {
        if (line.trim() === '{"done":true,"message":"Map links and map infos conversion to Studio done!"}') {
          didTheJob = true;
        }
      });
    });

    childProcess.on('exit', (code) => {
      log.info('migrate-maplinks.exit', code);
      if (rejectReason) reject(rejectReason);
      else if (!didTheJob) reject('migrate-maplinks did not migrated the data as expected. Please check your PSDK version.');
      else if (code === 0) resolve();
      else reject(`migrate-maplinks exited with code ${code}`);
    });
  });
};
