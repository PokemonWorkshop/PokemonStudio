import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { ENCOUNTER_VALIDATOR } from './groupEncounter';

export const TRAINER_BAG_ENTRY_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  amount: POSITIVE_INT,
});
export type StudioTrainerBagEntry = z.infer<typeof TRAINER_BAG_ENTRY_VALIDATOR>;

export const TRAINER_VS_TYPE = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type StudioTrainerVsType = z.infer<typeof TRAINER_VS_TYPE>;

export const TRAINER_MUSICS_VALIDATOR = z.object({
  encounter: z.string(),
  victory: z.string(),
  defeat: z.string(),
  bgm: z.string(),
});
export type StudioTrainerMusics = z.infer<typeof TRAINER_MUSICS_VALIDATOR>;

export const TRAINER_RESOURCES_VALIDATOR = z.object({
  sprite: z.string(),
  artworkFull: z.string(),
  artworkSmall: z.string(),
  character: z.string(),
  musics: TRAINER_MUSICS_VALIDATOR,
});
export type StudioTrainerResources = z.infer<typeof TRAINER_RESOURCES_VALIDATOR>;

export const TRAINER_VALIDATOR = z.object({
  klass: z.literal('TrainerBattleSetup'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  vsType: TRAINER_VS_TYPE,
  isCouple: z.boolean(),
  baseMoney: POSITIVE_OR_ZERO_INT,
  bagEntries: z.array(TRAINER_BAG_ENTRY_VALIDATOR),
  battleId: POSITIVE_OR_ZERO_INT,
  ai: POSITIVE_OR_ZERO_INT.default(1),
  party: z.array(ENCOUNTER_VALIDATOR),
  resources: TRAINER_RESOURCES_VALIDATOR,
});
export type StudioTrainer = z.infer<typeof TRAINER_VALIDATOR>;

export const TRAINER_CLASS_TEXT_ID = 100029;
export const TRAINER_NAME_TEXT_ID = 100062;
export const TRAINER_VICTORY_SENTENCE_TEXT_ID = 100047;
export const TRAINER_DEFEAT_SENTENCE_TEXT_ID = 100048;
export const getTrainerMoney = (trainer: StudioTrainer) => {
  if (trainer.party.length === 0 || isNaN(trainer.baseMoney)) return 0;

  const lastLevel = trainer.party[trainer.party.length - 1].levelSetup;

  if (lastLevel.kind === 'fixed') return trainer.baseMoney * lastLevel.level;
  return trainer.baseMoney * lastLevel.level.maximumLevel;
};
export const TRAINER_AI_CATEGORIES = ['basic', 'regular', 'medium', 'hard', 'lieutenant', 'gym_leader', 'champion'] as const;
export const TRAINER_VS_TYPE_CATEGORIES = [1, 2] as const;
export const updatePartyTrainerName = (trainer: StudioTrainer, name: string) => {
  trainer.party.forEach((encounter) => {
    encounter.expandPokemonSetup.forEach((expandPokemonSetup) => {
      if (expandPokemonSetup.type === 'originalTrainerName') expandPokemonSetup.value = name;
    });
  });
};
export const reduceBagEntries = (trainerBagEntries: StudioTrainerBagEntry[]) => {
  const bagEntries: StudioTrainerBagEntry[] = [];
  trainerBagEntries.forEach((bagEntry) => {
    const result = bagEntries.find((be) => be.dbSymbol === bagEntry.dbSymbol);
    if (result) result.amount += bagEntry.amount;
    else bagEntries.push(bagEntry);
  });
  return bagEntries;
};
