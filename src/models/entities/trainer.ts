import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { ENCOUNTER_VALIDATOR } from './groupEncounter';

export const TRAINER_BAG_ENTRY_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  amount: POSITIVE_INT,
});
export type StudioTrainerBagEntry = z.infer<typeof TRAINER_BAG_ENTRY_VALIDATOR>;

export const TRAINER_VALIDATOR = z.object({
  klass: z.literal('TrainerBattleSetup'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  vsType: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  isCouple: z.boolean(),
  baseMoney: POSITIVE_OR_ZERO_INT,
  battlers: z.array(z.string()).nonempty(),
  bagEntries: z.array(TRAINER_BAG_ENTRY_VALIDATOR),
  battleId: POSITIVE_OR_ZERO_INT,
  ai: POSITIVE_OR_ZERO_INT.default(1),
  party: z.array(ENCOUNTER_VALIDATOR),
});
export type StudioTrainer = z.infer<typeof TRAINER_VALIDATOR>;

export const TRAINER_CLASS_TEXT_ID = 29;
export const TRAINER_NAME_TEXT_ID = 62;
export const TRAINER_VICTORY_SENTENCE_TEXT_ID = 47;
export const TRAINER_DEFEAT_SENTENCE_TEXT_ID = 48;
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
export const reduceBagEntries = (trainer: StudioTrainer) => {
  const bagEntries: StudioTrainerBagEntry[] = [];
  trainer.bagEntries.forEach((bagEntry) => {
    const result = bagEntries.find((be) => be.dbSymbol === bagEntry.dbSymbol);
    if (result) result.amount += bagEntry.amount;
    else bagEntries.push(bagEntry);
  });
  trainer.bagEntries = bagEntries;
};
