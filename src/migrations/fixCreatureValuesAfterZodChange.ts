import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { CREATURE_FORM_VALIDATOR, CREATURE_VALIDATOR } from '@modelEntities/creature';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { parseJSON } from '@utils/json/parse';
import { POSITIVE_OR_ZERO_FLOAT } from '@modelEntities/common';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { cloneEntity } from '@utils/cloneEntity';

const PRE_MIGRATION_CREATURE_VALIDATOR = CREATURE_VALIDATOR.extend({
  forms: z
    .array(CREATURE_FORM_VALIDATOR.extend({ height: POSITIVE_OR_ZERO_FLOAT, weight: POSITIVE_OR_ZERO_FLOAT }).omit({ textId: true }))
    .nonempty(),
});
type StudioCreatureDataBeforeMigration = z.infer<typeof PRE_MIGRATION_CREATURE_VALIDATOR>;

const fixHeightAndWeightValues = (creature: StudioCreatureDataBeforeMigration) => {
  creature.forms.forEach((form) => {
    form.weight = form.weight === 0 ? 0.01 : form.weight;
    form.height = form.height === 0 ? 0.01 : form.height;
  });
};

const fixItemHeld = (creature: StudioCreatureDataBeforeMigration) => {
  creature.forms.forEach((form) => {
    if (form.itemHeld.length === 0) {
      form.itemHeld = [
        {
          dbSymbol: 'none' as DbSymbol,
          chance: 0,
        },
        {
          dbSymbol: 'none' as DbSymbol,
          chance: 0,
        },
      ];
    }
  });
};

export const fixCreatureValuesAfterZodChange = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const creatureData = await readProjectFolder(projectPath, 'pokemon');
  await creatureData.reduce(async (lastPromise, creature) => {
    await lastPromise;
    const creatureParsed = PRE_MIGRATION_CREATURE_VALIDATOR.safeParse(parseJSON(creature.data, creature.filename));
    if (creatureParsed.success) {
      const oldCreatureData = cloneEntity(creatureParsed.data);
      fixHeightAndWeightValues(creatureParsed.data);
      fixItemHeld(creatureParsed.data);
      // Optimisation: don't save if there are no changes
      if (JSON.stringify(oldCreatureData) === JSON.stringify(creatureParsed.data)) return;

      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/pokemon', `${creatureParsed.data.dbSymbol}.json`),
        JSON.stringify(creatureParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
