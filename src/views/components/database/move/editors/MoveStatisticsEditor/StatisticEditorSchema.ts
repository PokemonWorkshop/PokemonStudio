import { MOVE_BATTLE_STAGE_MOD_LIST, MOVE_BATTLE_STAGE_VALIDATOR } from '@modelEntities/move';
import { z } from 'zod';

export const STATISTIC_EDITOR_SCHEMA = z.object({
  battleStages: z
    .array(
      z.object({
        type: MOVE_BATTLE_STAGE_VALIDATOR,
        value: z.number().min(-99).max(99),
      }),
    )
    .length(MOVE_BATTLE_STAGE_MOD_LIST.length),
});

export type MoveStatisticsFormData = z.infer<typeof STATISTIC_EDITOR_SCHEMA>;
