import { z } from 'zod';
import { POSITIVE_INT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const CREATURE_QUEST_CONDITION_VALIDATOR = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pokemon'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('type'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('nature'), value: DB_SYMBOL_VALIDATOR }),
  z.object({ type: z.literal('minLevel'), value: POSITIVE_INT }),
  z.object({ type: z.literal('maxLevel'), value: POSITIVE_INT }),
  z.object({ type: z.literal('level'), value: POSITIVE_INT }),
]);
export type StudioCreatureQuestCondition = z.infer<typeof CREATURE_QUEST_CONDITION_VALIDATOR>;
export const CREATURE_QUEST_CONDITIONS = ['pokemon', 'type', 'nature', 'minLevel', 'maxLevel', 'level'] as const;
export type StudioCreatureQuestConditionType = typeof CREATURE_QUEST_CONDITIONS[number];

export const QUEST_OBJECTIVE_VALIDATOR = z.object({
  objectiveMethodName: z.union([
    z.literal('objective_speak_to'),
    z.literal('objective_beat_npc'),
    z.literal('objective_obtain_item'),
    z.literal('objective_see_pokemon'),
    z.literal('objective_beat_pokemon'),
    z.literal('objective_catch_pokemon'),
    z.literal('objective_obtain_egg'),
    z.literal('objective_hatch_egg'),
  ]),
  objectiveMethodArgs: z.array(z.union([z.string(), z.number(), z.array(CREATURE_QUEST_CONDITION_VALIDATOR), z.undefined()])),
  textFormatMethodName: z.string(),
  hiddenByDefault: z.boolean(),
});
export type StudioQuestObjective = z.infer<typeof QUEST_OBJECTIVE_VALIDATOR>;

export const QUEST_EARNING_VALIDATOR = z.object({
  earningMethodName: z.union([z.literal('earning_money'), z.literal('earning_item'), z.literal('earning_pokemon')]),
  earningArgs: z.array(z.union([z.string(), z.number()])),
  textFormatMethodName: z.string(),
});
export type StudioQuestEarning = z.infer<typeof QUEST_EARNING_VALIDATOR>;

export const QUEST_VALIDATOR = z.object({
  klass: z.literal('Quest'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  isPrimary: z.boolean(),
  resolution: z.union([z.literal('default'), z.literal('progressive')]),
  objectives: z.array(QUEST_OBJECTIVE_VALIDATOR),
  earnings: z.array(QUEST_EARNING_VALIDATOR),
});
export type StudioQuest = z.infer<typeof QUEST_VALIDATOR>;

export const QUEST_DESCRIPTION_TEXT_ID = 46;
export const QUEST_NAME_TEXT_ID = 45;

export const QUEST_CATEGORIES = ['primary', 'secondary'] as const;
export type StudioQuestCategory = typeof QUEST_CATEGORIES[number];

export const QUEST_RESOLUTIONS = ['default', 'progressive'] as const;
export type StudioQuestResolution = typeof QUEST_RESOLUTIONS[number];

export const QUEST_OBJECTIVES = [
  'objective_speak_to',
  'objective_beat_npc',
  'objective_obtain_item',
  'objective_see_pokemon',
  'objective_beat_pokemon',
  'objective_catch_pokemon',
  'objective_obtain_egg',
  'objective_hatch_egg',
] as const;
export type StudioQuestObjectiveType = typeof QUEST_OBJECTIVES[number];
export type StudioQuestObjectiveCategoryType = 'interaction' | 'battle' | 'discovery' | 'exploration';

export const QUEST_EARNINGS = ['earning_money', 'earning_item', 'earning_pokemon'] as const;
export type StudioQuestEarningType = typeof QUEST_EARNINGS[number];
export type StudioQuestEarningCategoryType = 'money' | 'item' | 'pokemon';

export const updateIndexSpeakToBeatNpc = (quest: StudioQuest) => {
  const index = { speakTo: 0, beatNpc: 0 };
  quest.objectives.forEach((objective) => {
    if (objective.objectiveMethodName === 'objective_speak_to' || objective.objectiveMethodName === 'objective_beat_npc') {
      if (objective.objectiveMethodName === 'objective_speak_to') objective.objectiveMethodArgs[0] = index.speakTo++;
      else objective.objectiveMethodArgs[0] = index.beatNpc++;
    }
  });
};
