import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioTrainer, TRAINER_CLASS_TEXT_ID, TRAINER_VALIDATOR } from '@modelEntities/trainer';
import { StudioTrainerClass, TRAINER_CLASS_DESCRIPTION_TEXT_ID, TRAINER_CLASS_NAME_TEXT_ID } from '@modelEntities/trainerClass';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import { generateDefaultDbSymbol } from '@utils/dbSymbolUtils';
import { parseJSON } from '@utils/json/parse';
import { getTextPath, loadCSV, saveCSV } from '@utils/textManagement';
import { IpcMainEvent } from 'electron';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';

const ENTITIES_TRAINER_CLASSES_PATH = 'Data/Studio/trainerClasses';

const PRE_MIGRATION_TRAINER_VALIDATOR = TRAINER_VALIDATOR.omit({ classSymbol: true });
type StudioTrainerDataBeforeMigration = z.infer<typeof PRE_MIGRATION_TRAINER_VALIDATOR>;

const buildUniqueDbSymbol = (name: string, id: number, usedSymbols: Set<string>): DbSymbol => {
  const base = generateDefaultDbSymbol(name) || (`trainer_class_${id}` as DbSymbol);
  let candidate: string = base;
  let suffix = 1;
  while (usedSymbols.has(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }
  usedSymbols.add(candidate);
  return candidate as DbSymbol;
};

export const migrateTrainerClassesToEntities = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const trainerClassesPath = path.join(projectPath, ENTITIES_TRAINER_CLASSES_PATH);
  if (!fs.existsSync(trainerClassesPath)) {
    await fsPromise.mkdir(trainerClassesPath, { recursive: true });
  }

  const nameCsvPath = path.join(projectPath, getTextPath(TRAINER_CLASS_NAME_TEXT_ID), `${TRAINER_CLASS_NAME_TEXT_ID}.csv`);
  const descriptionCsvPath = path.join(projectPath, getTextPath(TRAINER_CLASS_DESCRIPTION_TEXT_ID), `${TRAINER_CLASS_DESCRIPTION_TEXT_ID}.csv`);
  if (fs.existsSync(nameCsvPath)) throw new Error(`The file ${TRAINER_CLASS_NAME_TEXT_ID}.csv already exists. Please rename your file.`);
  if (fs.existsSync(descriptionCsvPath))
    throw new Error(`The file ${TRAINER_CLASS_DESCRIPTION_TEXT_ID}.csv already exists. Please rename your file.`);

  const currentTrainerClassNames = await loadCSV(path.join(projectPath, getTextPath(TRAINER_CLASS_TEXT_ID), `${TRAINER_CLASS_TEXT_ID}.csv`));
  const header = currentTrainerClassNames[0] || [];
  const rows = currentTrainerClassNames.slice(1);
  const englishIndex = header.indexOf('en');
  const nameColumnIndex = englishIndex !== -1 ? englishIndex : 0;

  const usedSymbols = new Set<string>();
  const uniqueRowsByKey = new Map<string, { row: string[]; trainerClass: StudioTrainerClass }>();
  rows.forEach((row) => {
    const key = row.join('\u0000');
    if (uniqueRowsByKey.has(key)) return;

    const id = uniqueRowsByKey.size;
    const dbSymbol = buildUniqueDbSymbol(row[nameColumnIndex] || '', id, usedSymbols);
    uniqueRowsByKey.set(key, { row, trainerClass: { klass: 'TrainerClass', id, dbSymbol } });
  });

  const trainerClasses = Array.from(uniqueRowsByKey.values());
  await trainerClasses.reduce(async (lastPromise, { trainerClass }) => {
    await lastPromise;
    return fsPromise.writeFile(path.join(trainerClassesPath, `${trainerClass.dbSymbol}.json`), JSON.stringify(trainerClass, null, 2));
  }, Promise.resolve());

  const trainerClassNameRows = [header, ...trainerClasses.map(({ row }) => row)];
  const trainerClassDescriptionRows = [header, ...trainerClasses.map(() => header.map(() => ''))];

  saveCSV(nameCsvPath, trainerClassNameRows);
  saveCSV(descriptionCsvPath, trainerClassDescriptionRows);

  const trainersPath = path.join(projectPath, 'Data/Studio/trainers');
  const trainers = await readProjectFolder(projectPath, 'trainers');
  await trainers.reduce(async (lastPromise, trainerFile) => {
    await lastPromise;
    const trainerParsed = PRE_MIGRATION_TRAINER_VALIDATOR.safeParse(
      parseJSON<StudioTrainerDataBeforeMigration>(trainerFile.data, trainerFile.filename),
    );
    if (!trainerParsed.success) return;

    const trainer = trainerParsed.data;
    const row = rows[trainer.id] || [];
    const classSymbol = uniqueRowsByKey.get(row.join('\u0000'))?.trainerClass.dbSymbol || ('__undef__' as DbSymbol);
    const trainerUpdated: StudioTrainer = { ...trainer, classSymbol };
    return fsPromise.writeFile(path.join(trainersPath, `${trainerUpdated.dbSymbol}.json`), JSON.stringify(trainerUpdated, null, 2));
  }, Promise.resolve());
};
