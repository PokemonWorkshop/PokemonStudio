import { DbSymbol } from '@modelEntities/dbSymbol';
import type { CommandId, StudioEventCommand } from '@modelEntities/event/command';
import {
  EVENT_START_CSV_FILE_ID,
  type Appearance,
  type CustomEvent,
  type EventAppearance,
  type EventTrigger,
  type LinkParameter,
  type MapEventLink,
} from '@modelEntities/event/event';
import { StudioMap } from '@modelEntities/map';
import { findFirstAvailableCsvFileId, findFirstAvailableId } from '@utils/ModelUtils';
import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { readRMXPEvents, RMXPEvent } from './readRMXPEvents';

type PartialStudioEvent = { dbSymbol: DbSymbol; id: number; csvFileId: number };
export type RMXPEventsToStudioEventsInput = { projectPath: string; map: string; events: PartialStudioEvent[] };
export type RMXPEventsToStudioEventsOutput = {};
//export type RMXPEventsToStudioEventsOutput = { map: StudioMap, events: PartialStudioEvent[], newStudioEvents: unknown[]}

const RMXP_TRIGGER_TO_STUDIO_TRIGGER: Record<number, EventTrigger> = {
  0: 'KeyPress', // action button
  1: 'Contact', // contact with player
  2: 'Overlap', // contact with event
  3: 'Cinematic', // autorun
  4: 'Parallel', // parallel processing
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

const createNewEventLink = (events: Record<string, PartialStudioEvent>, rmxpEvent: RMXPEvent): MapEventLink => {
  const id = findFirstAvailableId(events, 0);
  const csvFileId = findFirstAvailableCsvFileId(events, EVENT_START_CSV_FILE_ID);
  const dbSymbol = `event_${id}` as DbSymbol;
  events[dbSymbol] = { dbSymbol, id, csvFileId };

  return {
    conditions: [], // TODO:
    parameters: createLinkParameters(rmxpEvent, 0),
    eventDbSymbol: dbSymbol,
    defaultAppearance: createEventAppearance(rmxpEvent, 0),
    position: {
      x: rmxpEvent.x,
      y: rmxpEvent.y,
      z: getZTagFromEventName(rmxpEvent.name),
    },
  };
};

const getEventTriggers = (rmxpEvent: RMXPEvent): CustomEvent['triggers'] => {
  return rmxpEvent.pages.map(({ trigger, condition }) => ({
    type: RMXP_TRIGGER_TO_STUDIO_TRIGGER[trigger],
    conditions: [], // TODO: convert rmxp condition to studio condition
    commandId: '' as CommandId, // TODO: replace '' by ??
  }));
};

const createCustomEvent = (events: Record<string, PartialStudioEvent>, rmxpEvent: RMXPEvent, eventIdentifier: PartialStudioEvent): CustomEvent => {
  const csvFileId = findFirstAvailableCsvFileId(events, EVENT_START_CSV_FILE_ID);
  return {
    dbSymbol: eventIdentifier.dbSymbol,
    id: eventIdentifier.id,
    csvFileId,
    type: 'custom',
    triggers: getEventTriggers(rmxpEvent),
    commands: {} as Record<CommandId, StudioEventCommand>, // TODO: implement command lists
  };
};

export const convertRMXPEventsToStudioEvents = async (payload: RMXPEventsToStudioEventsInput): Promise<RMXPEventsToStudioEventsOutput> => {
  const map: StudioMap = JSON.parse(payload.map);
  const rmxpEvents = await readRMXPEvents(payload.projectPath, map.id);
  const newStudioEvents: CustomEvent[] = [];
  const newEventLinks: MapEventLink[] = [];
  const events = Object.fromEntries(payload.events.map((event) => [event.dbSymbol, event]));

  await rmxpEvents.reduce(async (lastPromise, rmxpEvent) => {
    await lastPromise;

    const newEventLink = createNewEventLink(events, rmxpEvent);
    newEventLinks.push(newEventLink);

    const newCustomEvent = createCustomEvent(events, rmxpEvent, events[newEventLink.eventDbSymbol]);
    newStudioEvents.push(newCustomEvent);
  }, Promise.resolve());

  // TODO: don't forget to remove this later
  log.info('======= Event link data in the map =======');
  newEventLinks.forEach((e) => log.info(e));
  log.info('======= Events =======');
  newStudioEvents.forEach((e) => log.info(e));

  return {};
};

const convertRMXPEventsToStudioEventsBackendService = async (payload: RMXPEventsToStudioEventsInput): Promise<RMXPEventsToStudioEventsOutput> => {
  log.info('convert-rmxp-events-to-studio-events', { mapId: JSON.parse(payload.map).id });

  const result = await convertRMXPEventsToStudioEvents(payload);

  log.info('convert-rmxp-events-to-studio-events/success');
  return result;
};

export const registerConvertRMXPEventsToStudioEvents = defineBackendServiceFunction(
  'convert-rmxp-events-to-studio-events',
  convertRMXPEventsToStudioEventsBackendService,
);
