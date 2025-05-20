import { StudioMap } from '@modelEntities/map';
import { readRMXPEvents, RMXPEvent } from './readRMXPEvents';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EventAppearance, MapEventLink } from '@modelEntities/event';
import log from 'electron-log';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

type PartialStudioEvent = { dbSymbol: DbSymbol; id: number };
export type RMXPEventsToStudioEventsInput = { projectPath: string; map: string; events: PartialStudioEvent[] };
export type RMXPEventsToStudioEventsOutput = {};
//export type RMXPEventsToStudioEventsOutput = { map: StudioMap, events: PartialStudioEvent[], newStudioEvents: unknown[]}

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

const createDefaultAppareance = (rmxpEvent: RMXPEvent): EventAppearance => {
  const name = rmxpEvent.name;
  const isFromTileset = rmxpEvent.pages[0].graphic.tileId !== 0;

  // TODO: We support the event appareance from tileset?
  if (isFromTileset) log.warn('The event appareance from tileset is not supported');

  return {
    appearance: {
      isFromTileset: false,
      character: rmxpEvent.pages[0].graphic.characterName,
    },
    direction: rmxpEvent.pages[0].graphic.direction,
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

const createNewEventLink = (events: Record<string, PartialStudioEvent>, rmxpEvent: RMXPEvent): MapEventLink => {
  const id = findFirstAvailableId(events, 0);
  const dbSymbol = `event_${id}` as DbSymbol;
  events[dbSymbol] = { dbSymbol, id };

  return {
    conditions: [], // TODO:
    parameters: {}, // TODO:
    eventDbSymbol: dbSymbol,
    defaultAppearance: createDefaultAppareance(rmxpEvent),
    position: {
      x: rmxpEvent.x,
      y: rmxpEvent.y,
      z: getZTagFromEventName(rmxpEvent.name),
    },
  };
};

export const convertRMXPEventsToStudioEvents = async (payload: RMXPEventsToStudioEventsInput): Promise<RMXPEventsToStudioEventsOutput> => {
  const map: StudioMap = JSON.parse(payload.map);
  const rmxpEvents = await readRMXPEvents(payload.projectPath, map.id);
  const newStudioEvents = [];
  const newEventLinks: MapEventLink[] = [];
  const events = Object.fromEntries(payload.events.map((event) => [event.dbSymbol, event]));

  await rmxpEvents.reduce(async (lastPromise, rmxpEvent) => {
    await lastPromise;

    const newEventLink = createNewEventLink(events, rmxpEvent);
    newEventLinks.push(newEventLink);
  }, Promise.resolve());

  // TODO: don't forget to remove this later
  newEventLinks.forEach((e) => log.info(e));

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
  convertRMXPEventsToStudioEventsBackendService
);
