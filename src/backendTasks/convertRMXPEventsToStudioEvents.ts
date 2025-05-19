import { StudioMap } from '@modelEntities/map';
import { readRMXPEvents, RMXPEvent } from './readRMXPEvents';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { MapEventLink } from '@modelEntities/event';
import log from 'electron-log';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

type PartialStudioEvent = { dbSymbol: DbSymbol; id: number };
export type RMXPEventsToStudioEventsInput = { projectPath: string; map: string; events: PartialStudioEvent[] };
export type RMXPEventsToStudioEventsOutput = {};
//export type RMXPEventsToStudioEventsOutput = { map: StudioMap, events: PartialStudioEvent[], newStudioEvents: unknown[]}

const createNewEventLink = (events: Record<string, PartialStudioEvent>, rmxpEvent: RMXPEvent): MapEventLink => {
  const id = findFirstAvailableId(events, 0);
  const dbSymbol = `event_${id}` as DbSymbol;
  events[dbSymbol] = { dbSymbol, id };

  return {
    conditions: [], // TODO:
    parameters: {}, // TODO:
    eventDbSymbol: dbSymbol,
    defaultAppearance: undefined, // TODO:
    position: {
      x: rmxpEvent.x,
      y: rmxpEvent.y,
      z: 0, // TODO: read the event name
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

  log.info(newEventLinks);

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
