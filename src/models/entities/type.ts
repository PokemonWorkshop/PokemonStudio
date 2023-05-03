import { z } from 'zod';
import { POSITIVE_OR_ZERO_FLOAT, POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

export const DAMAGE_TO_VALIDATOR = z.object({
  defensiveType: DB_SYMBOL_VALIDATOR,
  factor: POSITIVE_OR_ZERO_FLOAT,
});
export type StudioDamageTo = z.infer<typeof DAMAGE_TO_VALIDATOR>;

export const TYPE_VALIDATOR = z.object({
  klass: z.literal('Type'),
  id: POSITIVE_OR_ZERO_INT,
  dbSymbol: DB_SYMBOL_VALIDATOR,
  textId: POSITIVE_OR_ZERO_INT,
  damageTo: z.array(DAMAGE_TO_VALIDATOR),
  color: z.string().optional(),
});
export type StudioType = z.infer<typeof TYPE_VALIDATOR>;

export const TYPE_NAME_TEXT_ID = 100003;

const getTypesFromFactor = (allTypes: StudioType[], damageTo: StudioDamageTo[], factor: number) =>
  damageTo
    .filter((dmg) => dmg.factor === factor)
    .map((dmg) => allTypes.find((type) => type.dbSymbol === dmg.defensiveType))
    .filter<StudioType>((type): type is StudioType => type !== undefined);

export const getEfficiencies = (allTypes: StudioType[], type: StudioType) => {
  return {
    high: getTypesFromFactor(allTypes, type.damageTo, 2.0),
    low: getTypesFromFactor(allTypes, type.damageTo, 0.5),
    zero: getTypesFromFactor(allTypes, type.damageTo, 0),
  };
};

export const getEfficiency = (offensiveType: StudioType, defensiveType: StudioType, allTypes: StudioType[]) => {
  const { high, low, zero } = getEfficiencies(allTypes, offensiveType);
  if (high.includes(defensiveType)) return 'high_efficience';
  if (low.includes(defensiveType)) return 'low_efficience';
  if (zero.includes(defensiveType)) return 'zero_efficience';
  return 'neutral';
};
