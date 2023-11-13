import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';

const MAP_INFO_BASE_VALIDATOR = z.object({
  id: POSITIVE_OR_ZERO_INT,
  children: z.array(POSITIVE_OR_ZERO_INT),
  hasChildren: z.boolean(),
  isExpanded: z.boolean(),
});

export const MAP_INFO_FOLDER_VALIDATOR = MAP_INFO_BASE_VALIDATOR.extend({
  data: z.object({
    klass: z.literal('MapInfoFolder'),
    textId: POSITIVE_OR_ZERO_INT,
  }),
});
export type StudioMapInfoFolder = z.infer<typeof MAP_INFO_FOLDER_VALIDATOR>;

export const MAP_INFO_MAP_VALIDATOR = MAP_INFO_BASE_VALIDATOR.extend({
  data: z.object({
    klass: z.literal('MapInfoMap'),
    mapDbSymbol: DB_SYMBOL_VALIDATOR,
  }),
});
export type StudioMapInfoMap = z.infer<typeof MAP_INFO_MAP_VALIDATOR>;

export const MAP_INFO_ROOT_VALIDATOR = MAP_INFO_BASE_VALIDATOR.extend({
  data: z.object({
    klass: z.literal('MapInfoRoot'),
  }),
});

export const MAP_INFO_VALUE_VALIDATOR = z.union([MAP_INFO_FOLDER_VALIDATOR, MAP_INFO_MAP_VALIDATOR, MAP_INFO_ROOT_VALIDATOR]);
export type StudioMapInfoValue = z.infer<typeof MAP_INFO_VALUE_VALIDATOR>;

export const MAP_INFO_VALIDATOR = z.record(z.string(), MAP_INFO_VALUE_VALIDATOR);
export type StudioMapInfo = z.infer<typeof MAP_INFO_VALIDATOR>;

export const MAP_INFO_FOLDER_NAME_TEXT_ID = 200004;
