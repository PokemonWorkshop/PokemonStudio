import { POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioNature } from '@modelEntities/natures';
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

const searchNatureDbSymbolById = (dbSymbolToId: [string, number][], idSearched: number) => {
  const result = dbSymbolToId.find(([, id]) => id === idSearched);
  if (!result) throw new Error(`Impossible to find the nature "${idSearched}" in the natures config. Fail to migrate natures.`);

  return result[0] as DbSymbol;
};

const buildNatureEntities = (naturesConfig: StudioNatureConfig) => {
  const dbSymbolToId = Object.entries(naturesConfig.db_symbol_to_id);
  return naturesConfig.data.reduce<StudioNature[]>((natures, data) => {
    const nature: StudioNature = {
      klass: 'Nature',
      id: data[0],
      dbSymbol: searchNatureDbSymbolById(dbSymbolToId, data[0]),
      stats: {
        atk: data[1],
        dfe: data[2],
        spd: data[3],
        ats: data[4],
        dfs: data[5],
      },
      flavors: {
        favourite: 'bitter',
        detested: 'dry',
      },
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
    throw new Error(`The file ${CONFIG_NATURES_PATH} doesn't exist. Impossible to migrate natures.`);
  }

  const configNaturesFile = await fsPromises.readFile(configNaturesPath, { encoding: 'utf-8' });
  const configNaturesParsed = NATURE_CONFIG_VALIDATOR.safeParse(parseJSON(configNaturesFile, 'natures.json'));
  if (!configNaturesParsed.success) throw new Error('Fail to parse natures.json file.');

  const natures = buildNatureEntities(configNaturesParsed.data);
  await natures.reduce(async (prev, nature) => {
    await prev;
    await fsPromises.writeFile(path.join(naturesPath, `${nature.dbSymbol}.json`), JSON.stringify(nature, null, 2));
  }, Promise.resolve());

  //await fsPromises.unlink(path.join(projectPath, CONFIG_NATURES_PATH));
  //await fsPromises.unlink(path.join(projectPath, 'Data/configs/natures.rxdata'));
};
