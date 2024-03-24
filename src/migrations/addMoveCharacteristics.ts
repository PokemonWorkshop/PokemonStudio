import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { MOVE_VALIDATOR, StudioMove } from '@modelEntities/move';
import { parseJSON } from '@utils/json/parse';

const PRE_MIGRATION_MOVE_VALIDATOR = MOVE_VALIDATOR.omit({ isSlicingAttack: true, isWind: true });
type StudioMoveDataBeforeMigration = z.infer<typeof PRE_MIGRATION_MOVE_VALIDATOR>;

const addCharacteristics = (move: StudioMoveDataBeforeMigration): StudioMove => {
  return {
    ...move,
    isSlicingAttack: false,
    isWind: false,
  };
};

export const addMoveCharacteristics = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const moves = await readProjectFolder(projectPath, 'moves');
  await moves.reduce(async (lastPromise, move) => {
    await lastPromise;
    const moveParsed = PRE_MIGRATION_MOVE_VALIDATOR.safeParse(parseJSON<StudioMove>(move.data, move.filename));
    if (moveParsed.success) {
      const newMove = addCharacteristics(moveParsed.data);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/moves', `${newMove.dbSymbol}.json`), JSON.stringify(newMove, null, 2));
    }
  }, Promise.resolve());
};
