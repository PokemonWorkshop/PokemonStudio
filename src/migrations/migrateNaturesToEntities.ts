import { POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { DEFAULT_NATURES, StudioDefaultNature, StudioNature, StudioNatureFlavors } from '@modelEntities/nature';
import { parseJSON } from '@utils/json/parse';
import { IpcMainEvent } from 'electron';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const ENTITIES_NATURES_PATH = 'Data/Studio/natures';
const CONFIG_NATURES_PATH = 'Data/configs/natures.json';

const NATURE_CONFIG_VALIDATOR = z.object({
  klass: z.literal('Configs::Natures'),
  data: z.array(z.array(POSITIVE_OR_ZERO_INT)),
  db_symbol_to_id: z.record(POSITIVE_OR_ZERO_INT),
});
type StudioNatureConfig = z.infer<typeof NATURE_CONFIG_VALIDATOR>;

const defaultFlavors: Record<StudioDefaultNature, StudioNatureFlavors> = {
  adamant: {
    favourite: 'spicy',
    detested: 'dry',
  },
  bashful: {
    favourite: 'none',
    detested: 'none',
  },
  bold: {
    favourite: 'sour',
    detested: 'spicy',
  },
  brave: {
    favourite: 'spicy',
    detested: 'sweet',
  },
  calm: {
    favourite: 'bitter',
    detested: 'spicy',
  },
  careful: {
    favourite: 'bitter',
    detested: 'dry',
  },
  docile: {
    favourite: 'none',
    detested: 'none',
  },
  gentle: {
    favourite: 'bitter',
    detested: 'sour',
  },
  hardy: {
    favourite: 'none',
    detested: 'none',
  },
  hasty: {
    favourite: 'sweet',
    detested: 'sour',
  },
  impish: {
    favourite: 'sour',
    detested: 'dry',
  },
  jolly: {
    favourite: 'sweet',
    detested: 'dry',
  },
  lax: {
    favourite: 'sour',
    detested: 'bitter',
  },
  lonely: {
    favourite: 'spicy',
    detested: 'sour',
  },
  mild: {
    favourite: 'dry',
    detested: 'sour',
  },
  modest: {
    favourite: 'dry',
    detested: 'spicy',
  },
  naive: {
    favourite: 'sweet',
    detested: 'bitter',
  },
  naughty: {
    favourite: 'spicy',
    detested: 'bitter',
  },
  quiet: {
    favourite: 'dry',
    detested: 'sweet',
  },
  quirky: {
    favourite: 'none',
    detested: 'none',
  },
  rash: {
    favourite: 'dry',
    detested: 'bitter',
  },
  relaxed: {
    favourite: 'sour',
    detested: 'sweet',
  },
  sassy: {
    favourite: 'bitter',
    detested: 'sweet',
  },
  serious: {
    favourite: 'none',
    detested: 'none',
  },
  timid: {
    favourite: 'sweet',
    detested: 'spicy',
  },
};

const searchNatureDbSymbolById = (dbSymbolToId: [string, number][], idSearched: number) => {
  const result = dbSymbolToId.find(([, id]) => id === idSearched);
  if (!result) throw new Error(`Impossible to find the nature "${idSearched}" in the natures config. Fail to migrate natures.`);

  return result[0] as DbSymbol;
};

const getDefaultFlavors = (dbSymbol: DbSymbol): StudioNatureFlavors => {
  if ((DEFAULT_NATURES as readonly string[]).includes(dbSymbol)) {
    return defaultFlavors[dbSymbol as StudioDefaultNature];
  }
  return {
    favourite: 'none',
    detested: 'none',
  };
};

const buildNatureEntities = (naturesConfig: StudioNatureConfig) => {
  const dbSymbolToId = Object.entries(naturesConfig.db_symbol_to_id);
  return naturesConfig.data.reduce<StudioNature[]>((natures, data) => {
    const dbSymbol = searchNatureDbSymbolById(dbSymbolToId, data[0]);
    const nature: StudioNature = {
      klass: 'Nature',
      id: data[0],
      dbSymbol,
      stats: {
        atk: data[1],
        dfe: data[2],
        spd: data[3],
        ats: data[4],
        dfs: data[5],
      },
      flavors: getDefaultFlavors(dbSymbol),
    };
    return [...natures, nature];
  }, []);
};

export const migrateNaturesToEntities = async (_: IpcMainEvent, projectPath: string) => {
  const naturesPath = path.join(projectPath, ENTITIES_NATURES_PATH);
  if (!fs.existsSync(naturesPath)) {
    await fsPromises.mkdir(naturesPath, { recursive: true });
  }

  const configNaturesPath = path.join(projectPath, CONFIG_NATURES_PATH);
  if (!fs.existsSync(configNaturesPath)) {
    throw new Error(`The file ${CONFIG_NATURES_PATH} doesn't exist. Fail to migrate natures.`);
  }

  const configNaturesFile = await fsPromises.readFile(configNaturesPath, { encoding: 'utf-8' });
  const configNaturesParsed = NATURE_CONFIG_VALIDATOR.safeParse(parseJSON(configNaturesFile, 'natures.json'));
  if (!configNaturesParsed.success) throw new Error('Fail to parse natures.json file.');

  const natures = buildNatureEntities(configNaturesParsed.data);
  await natures.reduce(async (prev, nature) => {
    await prev;
    await fsPromises.writeFile(path.join(naturesPath, `${nature.dbSymbol}.json`), JSON.stringify(nature, null, 2));
  }, Promise.resolve());

  await fsPromises.unlink(path.join(projectPath, CONFIG_NATURES_PATH));
  await fsPromises.unlink(path.join(projectPath, 'Data/configs/natures.rxdata'));
};
