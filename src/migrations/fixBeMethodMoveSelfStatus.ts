import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { deletePSDKDatFile } from './migrateUtils';
import { MOVE_VALIDATOR, StudioMove } from '@modelEntities/move';

const fixSelfStatus = (move: StudioMove) => {
  if (move.battleEngineMethod === 's_self_statut') {
    move.battleEngineMethod = 's_self_status';
    return true;
  }
  return false;
};

export const fixBeMethodMoveSelfStatus = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const moves = await readProjectFolder(projectPath, 'moves');
  await moves.reduce(async (lastPromise, move) => {
    await lastPromise;
    const moveParsed = MOVE_VALIDATOR.safeParse(JSON.parse(move));
    if (moveParsed.success) {
      if (fixSelfStatus(moveParsed.data)) {
        return fsPromise.writeFile(
          path.join(projectPath, 'Data/Studio/moves', `${moveParsed.data.dbSymbol}.json`),
          JSON.stringify(moveParsed.data, null, 2)
        );
      } else {
        return Promise.resolve();
      }
    }
  }, Promise.resolve());
};
