import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { parseJSON } from '@utils/json/parse';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_FORM_VALIDATOR,
  CREATURE_NAME_TEXT_ID,
  CREATURE_VALIDATOR,
  StudioCreature,
  StudioCreatureForm,
} from '@modelEntities/creature';
import { loadCSV, saveCSV } from '@utils/textManagement';

const PRE_MIGRATION_CREATURE_VALIDATOR = CREATURE_VALIDATOR.extend({
  forms: z.array(CREATURE_FORM_VALIDATOR.omit({ formTextId: true })).nonempty(),
});
type StudioCreatureDataBeforeMigration = z.infer<typeof PRE_MIGRATION_CREATURE_VALIDATOR>;

let currentNameTextId = 0;
let currentDescriptionTextId = 1;

const addTextId = (creature: StudioCreatureDataBeforeMigration): StudioCreature => {
  creature.forms.forEach((form, index) => {
    if ('formTextId' in form) return; // Avoid add formTextId if it was already there

    const description = index === 0 ? 0 : currentDescriptionTextId++;
    const newForm = { ...form, formTextId: { name: currentNameTextId++, description } };
    creature.forms[index] = newForm as StudioCreatureForm;
  });
  return creature as StudioCreature;
};

const initCSVForm = (creatureTexts: string[][], csvPath: string, csvTextId: number, type: 'name' | 'description') => {
  if (fs.existsSync(path.join(csvPath, `${csvTextId}.csv`))) {
    throw new Error(`The file ${csvTextId}.csv already exists. Please rename your file.`);
  }

  const header = creatureTexts[0];
  const formTexts = [header];
  if (type === 'description') {
    const line = new Array(header.length).fill(`[~0]`);
    formTexts.push(line);
  }
  return formTexts;
};

const updateCSVFormTexts = (creatureTexts: string[][], formTexts: string[][], creature: StudioCreature, type: 'name' | 'description') => {
  const id = creature.id;
  const texts = creatureTexts[id + 1];
  creature.forms.forEach((form) => {
    if (form.form === 0 && type === 'description') return;

    formTexts.push(texts);
  });
};

export const addFormNamesDescriptions = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const csvPath = path.join(projectPath, 'Data/Text/Dialogs');
  const creatureNames = await loadCSV(path.join(csvPath, `${CREATURE_NAME_TEXT_ID}.csv`));
  const creatureDescriptions = await loadCSV(path.join(csvPath, `${CREATURE_DESCRIPTION_TEXT_ID}.csv`));
  const formNames = initCSVForm(creatureNames, csvPath, CREATURE_FORM_NAME_TEXT_ID, 'name');
  const formDescriptions = initCSVForm(creatureDescriptions, csvPath, CREATURE_FORM_DESCRIPTION_TEXT_ID, 'description');

  const creatures = await readProjectFolder(projectPath, 'pokemon');
  await creatures.reduce(async (lastPromise, creature) => {
    await lastPromise;
    const creatureParsed = PRE_MIGRATION_CREATURE_VALIDATOR.safeParse(parseJSON<StudioCreature>(creature.data, creature.filename));
    if (creatureParsed.success) {
      const newCreature = addTextId(creatureParsed.data);
      updateCSVFormTexts(creatureNames, formNames, newCreature, 'name');
      updateCSVFormTexts(creatureDescriptions, formDescriptions, newCreature, 'description');

      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/pokemon', `${newCreature.dbSymbol}.json`), JSON.stringify(newCreature, null, 2));
    }
  }, Promise.resolve());

  saveCSV(path.join(csvPath, `${CREATURE_FORM_NAME_TEXT_ID}.csv`), formNames);
  saveCSV(path.join(csvPath, `${CREATURE_FORM_DESCRIPTION_TEXT_ID}.csv`), formDescriptions);
};
