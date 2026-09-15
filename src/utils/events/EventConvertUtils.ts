import { StudioEventCommand } from '@modelEntities/event/command';
import { Appearance, EventAppearance, LinkParameter, MapEventLink, StudioEvent } from '@modelEntities/event/event';
import { CommandId } from '@modelEntities/event/globalCommand';
import { StudioEventCommandWaitMovementCompletion } from '@modelEntities/event/movementCommands/waitMovementCompletion';
import { StudioEventCommandInsertScript } from '@modelEntities/event/scriptCommands/insertScript';
import { StudioEventCommandStart, StudioEventTrigger } from '@modelEntities/event/startCommands/start';
import { ProjectData } from '@src/GlobalStateProvider';
import { createInsertScriptCommand, createWaitMovementCompletionCommand } from '@utils/eventCommandCreation';
import { EVENT_GRID_SIZE, getCommandId } from './EventUtils';
import type { ConversionData, RMXPEvent, RMXPEventCommand, RMXPEventPage } from './types';

export const RMXP_TRIGGER_TO_STUDIO_TRIGGER: Record<number, StudioEventTrigger> = {
  0: 'key_press', // action button
  1: 'contact', // contact with player
  2: 'overlap', // contact with event
  3: 'cinematic', // autorun
  4: 'parallel', // parallel processing
};

// Based from Game_Event and Sprite_Characters PSDK scripts

/** Tag inside an event that put it in the surfing state */
const getSurfingTagFromEventName = (name: string) => name.includes('surf_');

/** Tag that sets the event in an invisible state (not triggerd unless in front of it) */
const getInvisibleEventTagFromEventName = (name: string) => name === 'OBJ_INVISIBLE' || name.includes('invisible_');

/** Tag that tells the event to always take the character_name of the first page when page change */
const getAutoCharsetFromEventName = (name: string) => name.includes('$');

/** Tag that tells the event not to push particles when it moves */
const getParticleOffFromEventName = (name: string) => name.includes('[particle=off]');

/** Tag that detect offset_screen */
const getOffsetFromEventName = (name: string, offset: 'x' | 'y') => {
  const match = offset === 'x' ? name.match(/\[offset_x=(\d+)\]/) : name.match(/\[offset_y=(\d+)\]/);
  if (match) return parseInt(match[1], 10);

  return 0;
};

/** Tag that forbid the creation of a Sprite_Character for this event */
const getNoSpriteTagFromEventName = (name: string) => name.includes('[sprite=off]');

/** Tag that give the event an symbol alias */
const getSymbolAliasTag = (name: string) => {
  const match = name.match(/\[alias=([a-z\-0-9\-_]+)\]/);
  if (match) return match[1];

  return '';
};

/** Tag that detect z= */
const getZTagFromEventName = (name: string) => {
  const match = name.match(/\[z=(\d+)\]/);
  if (match) return parseInt(match[1], 10);

  return 0;
};

/** Tag enabling no slide */
const getNoSlideTagFromEventName = (name: string) => name.includes('[noslide=on]');

/** Tag enabling reflection */
const getReflectionTagFromEventName = (name: string) => name.includes('[reflection=on]');

/** Tag that disable shadow */
const getDisableShadowTagFromEventName = (name: string) => name.includes('§');

/** Tag that add 1 to the superiority of the Sprite_Character */
const getSupTagFromEventName = (name: string) => name.startsWith('¤');

const createEventAppearance = (rmxpEvent: RMXPEvent, pageIndex: number): EventAppearance => {
  const name = rmxpEvent.name;
  const graphic = rmxpEvent.pages[pageIndex].graphic;
  const tileId = graphic.tileId;

  const appearance: Appearance =
    tileId !== 0
      ? { isFromTileset: true, tileId }
      : {
          isFromTileset: false,
          characterName: graphic.characterName,
          pattern: graphic.pattern,
        };

  return {
    appearance,
    direction: graphic.direction,
    hue: graphic.characterHue,
    opacity: graphic.opacity,
    blendType: graphic.blendType,
    hasReflection: getReflectionTagFromEventName(name),
    hasShadow: !getDisableShadowTagFromEventName(name),
    isInvisible: getInvisibleEventTagFromEventName(name),
    isSurfing: getSurfingTagFromEventName(name),
    offsets: {
      x: getOffsetFromEventName(name, 'x'),
      y: getOffsetFromEventName(name, 'y'),
    },
  };
};

const createLinkParameters = (rmxpEvent: RMXPEvent, pageIndex: number): LinkParameter => {
  const name = rmxpEvent.name;
  const page = rmxpEvent.pages[pageIndex];

  return {
    moveType: page.moveType,
    moveSpeed: page.moveSpeed,
    moveFrequency: page.moveFrequency,
    isAlwaysOnTop: page.isAlwaysOnTop,
    isDirectionFix: page.isDirectionFix,
    isStepAnime: page.isStepAnime,
    isThrough: page.isThrough,
    isWalkAnime: page.isWalkAnime,
    hasParticuleOff: getParticleOffFromEventName(name),
    hasNoSlide: getNoSlideTagFromEventName(name),
    hasSubTag: getSupTagFromEventName(name),
    hasNoSpriteTag: getNoSpriteTagFromEventName(name),
    symbolAliasTag: getSymbolAliasTag(name),
  };
};

const createNewEventLink = (allEvents: ProjectData['events'], rmxpEvent: RMXPEvent, event: StudioEvent): MapEventLink => {
  return {
    conditions: [], // TODO:
    parameters: createLinkParameters(rmxpEvent, 0),
    eventDbSymbol: event.dbSymbol,
    defaultAppearance: createEventAppearance(rmxpEvent, 0),
    position: {
      x: rmxpEvent.x,
      y: rmxpEvent.y,
      z: getZTagFromEventName(rmxpEvent.name),
    },
  };
};

/*const getEventTriggers = (rmxpEvent: RMXPEvent): StudioEvent['triggers'] => {
  return rmxpEvent.pages.map(({ trigger, condition }) => ({
    type: RMXP_TRIGGER_TO_STUDIO_TRIGGER[trigger],
    conditions: [], // TODO: convert rmxp condition to studio condition
    commandId: '' as CommandId, // TODO: replace '' by ??
  }));
};

export const createCustomEvent = (allEvents: ProjectData['events'], rmxpEvent: RMXPEvent): CustomEvent => {
  const newEvent = createEvent(allEvents);
  return {
    ...newEvent,
    triggers: getEventTriggers(rmxpEvent),
    commands: {} as Record<CommandId, StudioEventCommand>, // TODO: implement command lists
  };
};*/

// RMXP command 210
const convertWaitMouvementCompletionCommand = (): StudioEventCommandWaitMovementCompletion => ({
  type: 'wait_move_completion',
  connections: {},
  studioData: { x: 0, y: 0, comments: [] },
  ...createWaitMovementCompletionCommand(),
});

// RMXP command 355
const convertInsertScriptCommand = (_: StudioEvent, params: unknown[]): StudioEventCommandInsertScript => {
  const script = (params[0] as string) || '# unable to convert the script command';
  return {
    type: 'insert_script',
    connections: {},
    studioData: { x: 0, y: 0, comments: [] },
    ...createInsertScriptCommand(_, script),
  };
};

// RMXP command 655
const convertInsertScriptMultilineCommand = (_: StudioEvent, params: unknown[], command: StudioEventCommand): StudioEventCommandInsertScript => {
  const insertScriptCommand = command as StudioEventCommandInsertScript;
  const newScript = (params[0] as string) || '# unable to convert the script command';
  return {
    ...insertScriptCommand,
    script: `${insertScriptCommand.script}\n${newScript}`,
  };
};

const RMXPCommandToStudioCommand: Record<number, (event: StudioEvent, params: unknown[]) => StudioEventCommand> = {
  210: convertWaitMouvementCompletionCommand,
  355: convertInsertScriptCommand,
};

const RMXPCommandMultilineToStudioCommand: Record<
  number,
  (event: StudioEvent, params: unknown[], command: StudioEventCommand) => StudioEventCommand
> = {
  655: convertInsertScriptMultilineCommand,
};

export const convertCommand = (
  rmxpCommand: RMXPEventCommand,
  commands: StudioEvent['commands'],
  event: StudioEvent,
  conversionData: ConversionData,
): { command: StudioEventCommand; isNewCommand: boolean } | undefined => {
  const convertCommand = RMXPCommandToStudioCommand[rmxpCommand.code];
  if (convertCommand) {
    const command = convertCommand(event, rmxpCommand.parameters);
    return { command, isNewCommand: true };
  }

  const convertCommandMultiline = RMXPCommandMultilineToStudioCommand[rmxpCommand.code];
  if (!convertCommandMultiline || !conversionData.lastCommandId) return undefined;

  const lastCommand = commands[conversionData.lastCommandId];
  if (!lastCommand) return undefined;

  const commandMultiline = convertCommandMultiline(event, rmxpCommand.parameters, lastCommand);
  return { command: commandMultiline, isNewCommand: false };
};

export const convertTrigger = (event: StudioEvent, rmxpEvent: RMXPEvent, page: RMXPEventPage, pageIndex: number) => {
  const commandId = getCommandId(event) as CommandId;
  const command: StudioEventCommandStart = {
    type: 'start',
    connections: {},
    priority: rmxpEvent.pages.length - pageIndex,
    studioData: { comments: [], x: 0, y: (rmxpEvent.pages.length - pageIndex) * EVENT_GRID_SIZE * 8 },
    trigger: RMXP_TRIGGER_TO_STUDIO_TRIGGER[page.trigger],
  };
  return { command, commandId };
};
