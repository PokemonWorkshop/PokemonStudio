import { ZodType, ZodTypeDef, z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

const MAP_INFO_MAP_WITHOUT_CHILDREN_VALIDATOR = z.object({
  klass: z.literal('MapInfoMap'),
  id: POSITIVE_OR_ZERO_INT,
  mapDbSymbol: DB_SYMBOL_VALIDATOR,
  collapsed: z.boolean(),
});

type StudioMapInfoMapInput = z.input<typeof MAP_INFO_MAP_WITHOUT_CHILDREN_VALIDATOR> & {
  children: StudioMapInfoMapInput[];
};

export type StudioMapInfoMap = z.output<typeof MAP_INFO_MAP_WITHOUT_CHILDREN_VALIDATOR> & {
  children: StudioMapInfoMap[];
};

export const MAP_INFO_MAP_VALIDATOR: ZodType<StudioMapInfoMap, ZodTypeDef, StudioMapInfoMapInput> = MAP_INFO_MAP_WITHOUT_CHILDREN_VALIDATOR.extend({
  children: z.lazy(() => MAP_INFO_MAP_VALIDATOR.array()),
});

export const MAP_INFO_FOLDER_VALIDATOR = z.object({
  klass: z.literal('MapInfoFolder'),
  id: POSITIVE_OR_ZERO_INT,
  textId: POSITIVE_OR_ZERO_INT,
  collapsed: z.boolean(),
  children: z.array(MAP_INFO_MAP_VALIDATOR),
});
export type StudioMapInfoFolder = z.infer<typeof MAP_INFO_FOLDER_VALIDATOR>;

export const MAP_INFO_VALIDATOR = z.union([MAP_INFO_MAP_VALIDATOR, MAP_INFO_FOLDER_VALIDATOR]);
export type StudioMapInfo = z.infer<typeof MAP_INFO_VALIDATOR>;

export const MAP_INFO_FOLDER_NAME_TEXT_ID = 200004;
