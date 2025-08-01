import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import fs from 'fs';
import { deletePSDKDatFile } from './migrateUtils';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_CONTEST_DESCRIPTION_TEXT_ID, MOVE_VALIDATOR, StudioMove } from '@modelEntities/move';
import { parseJSON } from '@utils/json/parse';
import { loadCSV, saveCSV } from '@utils/textManagement';

const PRE_MIGRATION_MOVE_VALIDATOR = MOVE_VALIDATOR.omit({ condition: true, appeal: true, jam: true, comboMoves: true, effectTags: true });
type StudioMoveDataBeforeMigration = z.infer<typeof PRE_MIGRATION_MOVE_VALIDATOR>;

const createNewCsv = async (projectPath: string) => {
  const csvPath = path.join(projectPath, 'Data/Text/Dialogs');
  if (fs.existsSync(path.join(csvPath, `${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv`))) {
    throw new Error(`The file ${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv already exists. Please rename your file.`);
  }

  const movesDescriptions = await loadCSV(path.join(csvPath, `${MOVE_DESCRIPTION_TEXT_ID}.csv`));
  const header = movesDescriptions[0];
  saveCSV(path.join(csvPath, `${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv`), [header]);
};

const addDefaultContestData = (move: StudioMoveDataBeforeMigration): StudioMove => {
  return {
    ...move,
    condition: 'cool',
    appeal: 4,
    jam: 0,
    comboMoves: [],
    effectTags: [],
  };
};

export const addMoveContestData = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  await createNewCsv(projectPath);

  const moves = await readProjectFolder(projectPath, 'moves');
  await moves.reduce(async (lastPromise, move) => {
    await lastPromise;
    const moveParsed = PRE_MIGRATION_MOVE_VALIDATOR.safeParse(parseJSON<StudioMove>(move.data, move.filename));
    if (moveParsed.success) {
      const newMove = addDefaultContestData(moveParsed.data);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/moves', `${newMove.dbSymbol}.json`), JSON.stringify(newMove, null, 2));
    }
  }, Promise.resolve());
};
