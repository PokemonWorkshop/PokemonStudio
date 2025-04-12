import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import fs from 'fs';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import { CREATURE_FORM_VALIDATOR, CREATURE_RESOURCES_VALIDATOR, CREATURE_VALIDATOR, StudioCreatureResources } from '@modelEntities/creature';
import { parseJSON } from '@utils/json/parse';
import { padStr } from '@utils/PadStr';

const PRE_MIGRATION_CREATURE_FORM_VALIDATOR = CREATURE_FORM_VALIDATOR.extend({
  resources: CREATURE_RESOURCES_VALIDATOR.omit({ egg: true, iconEgg: true }),
});
const PRE_MIGRATION_CREATURE_VALIDATOR = CREATURE_VALIDATOR.extend({ forms: z.array(PRE_MIGRATION_CREATURE_FORM_VALIDATOR).nonempty() });

type StudioCreatureDataBeforeMigration = z.infer<typeof PRE_MIGRATION_CREATURE_VALIDATOR>;

const GRAPHICS_FRONT_PATH = 'graphics/pokedex/pokefront';
const GRAPHICS_ICON_PATH = 'graphics/pokedex/pokeicon';
const DEFAULT_EGG_RESOURCE = 'egg';

const resourceExists = (resourcePath: string) => {
  return fs.existsSync(`${resourcePath}.gif`) || fs.existsSync(`${resourcePath}.png`);
};

const addEggResource = async (
  creature: StudioCreatureDataBeforeMigration,
  projectPath: string,
  hasDefaultEggSprite: boolean,
  hasDefaultEggIcon: boolean
) => {
  const filename = `${DEFAULT_EGG_RESOURCE}_${padStr(creature.id, 3)}`;
  const hasCustomEggSprite = resourceExists(path.join(projectPath, GRAPHICS_FRONT_PATH, filename));
  const hasCustomEggIcon = resourceExists(path.join(projectPath, GRAPHICS_ICON_PATH, filename));

  await creature.forms.reduce(async (lastPromise, form) => {
    await lastPromise;

    form.resources = {
      ...form.resources,
      egg: hasCustomEggSprite ? filename : hasDefaultEggSprite ? DEFAULT_EGG_RESOURCE : '',
      iconEgg: hasCustomEggIcon ? filename : hasDefaultEggIcon ? DEFAULT_EGG_RESOURCE : '',
    } as StudioCreatureResources;
  }, Promise.resolve());
};

export const addEggInCreatureResources = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const hasDefaultEggSprite = resourceExists(path.join(projectPath, GRAPHICS_FRONT_PATH, DEFAULT_EGG_RESOURCE));
  const hasDefaultEggIcon = resourceExists(path.join(projectPath, GRAPHICS_ICON_PATH, DEFAULT_EGG_RESOURCE));

  const creatures = await readProjectFolder(projectPath, 'pokemon');
  await creatures.reduce(async (lastPromise, creature) => {
    await lastPromise;
    const creatureParsed = PRE_MIGRATION_CREATURE_VALIDATOR.safeParse(parseJSON(creature.data, creature.filename));
    if (creatureParsed.success) {
      await addEggResource(creatureParsed.data, projectPath, hasDefaultEggSprite, hasDefaultEggIcon);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/pokemon', `${creatureParsed.data.dbSymbol}.json`),
        JSON.stringify(creatureParsed.data, null, 2)
      );
    }
  }, Promise.resolve());
};
