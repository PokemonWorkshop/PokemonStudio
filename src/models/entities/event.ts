import { z } from 'zod';
import { DB_SYMBOL_VALIDATOR } from './dbSymbol';
import { POSITIVE_OR_ZERO_INT } from './common';

const COMMAND_LIST_ID_VALIDATOR = z.string().brand('CommandListId');
export type CommandListId = z.infer<typeof COMMAND_LIST_ID_VALIDATOR>;

const TEMPLATE_PARAMETER_NAME_VALIDATOR = z.string().brand('TemplateParameterName');

const COMMAND_VALIDATOR = z.object({}); // TODO: update this when the command type will be defined
const TRIGGER_CONDITION_VALIDATOR = z.object({}); // TODO: update this when the trigger condition type will be defined
const TEMPLATE_PARAMETER_VALIDATOR = z.object({}); // TODO: update this when the template parameter type will be defined
const TEMPLATE_PARAMETER_INSTANCE_VALIDATOR = z.object({}); // TODO: update this when the template parameter instance type will be defined
const MAP_EVENT_LINK_CONDITION_VALIDATOR = z.object({}); // TODO: update this when the map event link condition type will be defined

const LINK_PARAMETER_VALIDATOR = z.object({
  moveType: POSITIVE_OR_ZERO_INT,
  moveSpeed: POSITIVE_OR_ZERO_INT,
  moveFrequency: POSITIVE_OR_ZERO_INT,
  isWalkAnime: z.boolean(),
  isStepAnime: z.boolean(),
  isDirectionFix: z.boolean(),
  isThrough: z.boolean(),
  isAlwaysOnTop: z.boolean(),
  hasParticuleOff: z.boolean(),
  hasNoSlide: z.boolean(),
});
export type LinkParameter = z.infer<typeof LINK_PARAMETER_VALIDATOR>;

const COORDINATE_VALIDATOR = z.object({
  x: POSITIVE_OR_ZERO_INT,
  y: POSITIVE_OR_ZERO_INT,
  z: POSITIVE_OR_ZERO_INT,
});

const EVENT_TRIGGER_TYPE_VALIDATOR = z.union([
  z.literal('KeyPress'),
  z.literal('Contact'),
  z.literal('Overlap'),
  z.literal('BeforeTransition'),
  z.literal('Called'),
  z.literal('Parallel'),
  z.literal('Cinematic'),
]);
export type EventTrigger = z.infer<typeof EVENT_TRIGGER_TYPE_VALIDATOR>;

const EVENT_TRIGGER_VALIDATOR = z.object({
  type: EVENT_TRIGGER_TYPE_VALIDATOR,
  conditions: z.array(TRIGGER_CONDITION_VALIDATOR),
  commandListId: COMMAND_LIST_ID_VALIDATOR,
});

export const CUSTOM_EVENT_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  id: POSITIVE_OR_ZERO_INT,
  type: z.literal('custom'),
  commandLists: z.record(COMMAND_LIST_ID_VALIDATOR, z.array(COMMAND_VALIDATOR)),
  triggers: z.array(EVENT_TRIGGER_VALIDATOR),
});
export type CustomEvent = z.infer<typeof CUSTOM_EVENT_VALIDATOR>;

export const TEMPLATE_EVENT_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  type: z.literal('template'),
  commandLists: z.record(COMMAND_LIST_ID_VALIDATOR, z.array(COMMAND_VALIDATOR)),
  triggers: z.array(EVENT_TRIGGER_VALIDATOR),
  defaultLinkParameters: LINK_PARAMETER_VALIDATOR.partial(),
  allowLinkParameterChange: z.boolean(),
  templateParameters: z.array(TEMPLATE_PARAMETER_VALIDATOR),
});
export type TemplateEvent = z.infer<typeof TEMPLATE_EVENT_VALIDATOR>;

export const TEMPLATE_USE_EVENT_VALIDATOR = z.object({
  dbSymbol: DB_SYMBOL_VALIDATOR,
  type: z.literal('templateUseEvent'),
  templateId: z.string(),
  parameters: z.record(TEMPLATE_PARAMETER_NAME_VALIDATOR, TEMPLATE_PARAMETER_INSTANCE_VALIDATOR),
});
export type TemplateUseEvent = z.infer<typeof TEMPLATE_USE_EVENT_VALIDATOR>;

export const APPEARANCE_VALIDATOR = z.union([
  z.object({
    isFromTileset: z.literal(true),
    tileId: POSITIVE_OR_ZERO_INT,
  }),
  z.object({
    isFromTileset: z.literal(false),
    characterName: z.string(),
    pattern: POSITIVE_OR_ZERO_INT,
  }),
]);
export type Appearance = z.infer<typeof APPEARANCE_VALIDATOR>;

export const EVENT_APPEARANCE_VALIDATOR = z.object({
  appearance: APPEARANCE_VALIDATOR,
  direction: POSITIVE_OR_ZERO_INT,
  hue: POSITIVE_OR_ZERO_INT,
  opacity: POSITIVE_OR_ZERO_INT,
  blendType: POSITIVE_OR_ZERO_INT,
  hasShadow: z.boolean(),
  isSurfing: z.boolean(),
  isInvisible: z.boolean(),
  hasReflection: z.boolean(),
  offsets: z.object({ x: z.number(), y: z.number() }),
});
export type EventAppearance = z.infer<typeof EVENT_APPEARANCE_VALIDATOR>;

export const MAP_EVENT_LINK_VALIDATOR = z.object({
  conditions: z.array(MAP_EVENT_LINK_CONDITION_VALIDATOR),
  parameters: LINK_PARAMETER_VALIDATOR.partial(),
  eventDbSymbol: DB_SYMBOL_VALIDATOR,
  defaultAppearance: EVENT_APPEARANCE_VALIDATOR.optional(),
  position: COORDINATE_VALIDATOR,
});
export type MapEventLink = z.infer<typeof MAP_EVENT_LINK_VALIDATOR>;
