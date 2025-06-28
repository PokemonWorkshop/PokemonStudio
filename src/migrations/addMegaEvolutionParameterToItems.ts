import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import { deletePSDKDatFile } from './migrateUtils';
import {
  ALL_PP_HEALING_ITEM_VALIDATOR,
  BALL_ITEM_VALIDATOR,
  CONSTANT_HEALING_ITEM_VALIDATOR,
  EV_BOOST_ITEM_VALIDATOR,
  EVENT_ITEM_VALIDATOR,
  EXP_INCREASE_ITEM_VALIDATOR,
  FLEEING_ITEM_VALIDATOR,
  HEALING_ITEM_VALIDATOR,
  LEVEL_INCREASE_ITEM_VALIDATOR,
  PP_HEALING_ITEM_VALIDATOR,
  PP_INCREASE_ITEM_VALIDATOR,
  RATE_HEALING_ITEM_VALIDATOR,
  REPEL_ITEM_VALIDATOR,
  STAT_BOOST_ITEM_VALIDATOR,
  STATUS_CONSTANT_HEALING_ITEM_VALIDATOR,
  STATUS_HEALING_ITEM_VALIDATOR,
  STATUS_RATE_HEALING_ITEM_VALIDATOR,
  STONE_ITEM_VALIDATOR,
  StudioItem,
  TECH_ITEM_VALIDATOR,
  UNKNOWN_ITEM_VALIDATOR,
} from '@modelEntities/item';
import { parseJSON } from '@utils/json/parse';

// C'est moche, mais d'après ce ticket y a pas moyen de faire autrement https://github.com/colinhacks/zod/discussions/1434
const PRE_MIGRATION_ITEM_VALIDATOR = z.discriminatedUnion('klass', [
  UNKNOWN_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  PP_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  ALL_PP_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  BALL_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  CONSTANT_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  STAT_BOOST_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  EV_BOOST_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  EVENT_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  FLEEING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  LEVEL_INCREASE_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  EXP_INCREASE_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  PP_INCREASE_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  RATE_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  REPEL_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  STATUS_CONSTANT_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  STATUS_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  STATUS_RATE_HEALING_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  STONE_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
  TECH_ITEM_VALIDATOR.omit({ isAllowingMega: true }),
]);
type StudioItemDataBeforeMigration = z.infer<typeof PRE_MIGRATION_ITEM_VALIDATOR>;

const MEGA_TOOLS = [
  'mega_ring',
  'mega_bracelet',
  'mega_pendant',
  'mega_glasses',
  'mega_anchor',
  'mega_stickpin',
  'mega_tiara',
  'mega_anklet',
  'mega_cuff',
  'mega_charm',
  'mega_glove',
];

const addParameter = (item: StudioItemDataBeforeMigration): StudioItem => {
  return {
    ...item,
    isAllowingMega: MEGA_TOOLS.includes(item.dbSymbol),
  };
};

export const addMegaEvolutionParameterToItems = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const items = await readProjectFolder(projectPath, 'items');
  await items.reduce(async (lastPromise, item) => {
    await lastPromise;
    const itemParsed = PRE_MIGRATION_ITEM_VALIDATOR.safeParse(parseJSON<StudioItem>(item.data, item.filename));
    if (itemParsed.success) {
      const newItem = addParameter(itemParsed.data);
      return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/items', `${newItem.dbSymbol}.json`), JSON.stringify(newItem, null, 2));
    }
  }, Promise.resolve());
};
