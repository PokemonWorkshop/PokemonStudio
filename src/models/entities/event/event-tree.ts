import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from '../common';
import { DB_SYMBOL_VALIDATOR } from '../dbSymbol';
import type { TreeItem } from '../../../views/components/tree';

const EVENT_TREE_BASE_VALIDATOR = z.object({
  id: z.union([POSITIVE_OR_ZERO_INT, z.string()]),
  children: z.array(z.union([POSITIVE_OR_ZERO_INT, z.string()])),
  hasChildren: z.boolean(),
  isExpanded: z.boolean(),
});

export const EVENT_TREE_ROOT_VALIDATOR = EVENT_TREE_BASE_VALIDATOR.extend({
  id: z.literal(0),
  children: z.array(DB_SYMBOL_VALIDATOR),
  data: z.object({
    klass: z.literal('EventRoot'),
  }),
});

export const EVENT_TREE_FOLDER_VALIDATOR = EVENT_TREE_BASE_VALIDATOR.extend({
  data: z.object({
    klass: z.literal('EventFolder'),
    dbSymbol: DB_SYMBOL_VALIDATOR,
    id: POSITIVE_OR_ZERO_INT,
  }),
});

export const EVENT_FOLDER_NAME_TEXT_ID = 200006;

export type StudioEventTreeFolder = z.infer<typeof EVENT_TREE_FOLDER_VALIDATOR>;

export const EVENT_TREE_EVENT_VALIDATOR = EVENT_TREE_BASE_VALIDATOR.extend({
  data: z.object({
    klass: z.literal('Event'),
    dbSymbol: DB_SYMBOL_VALIDATOR,
    id: POSITIVE_OR_ZERO_INT,
  }),
});
export type StudioEventTreeEvent = z.infer<typeof EVENT_TREE_EVENT_VALIDATOR>;

export const EVENT_TREE_VALUE_VALIDATOR = z.union([EVENT_TREE_ROOT_VALIDATOR, EVENT_TREE_FOLDER_VALIDATOR, EVENT_TREE_EVENT_VALIDATOR]);
export type StudioEventTreeValue = z.infer<typeof EVENT_TREE_VALUE_VALIDATOR>;
export type StudioEventTreeItem = TreeItem & {
  data?: StudioEventTreeValue['data'];
};

export const EVENT_TREE_VALIDATOR = z.record(z.string(), EVENT_TREE_VALUE_VALIDATOR);
export type StudioEventTree = z.infer<typeof EVENT_TREE_VALIDATOR>;
export type StudioEventTreeItemData = StudioEventTreeValue['data'];

export const DEFAULT_EVENT_TREE: StudioEventTree = {
  ['0']: {
    id: 0,
    children: [],
    hasChildren: false,
    isExpanded: true,
    data: {
      klass: 'EventRoot',
    },
  },
};
