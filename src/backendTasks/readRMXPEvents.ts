import type {
  RMXPEvent,
  RMXPEventCommand,
  RMXPEventPage,
  RMXPEventPageCondition,
  RMXPEventPageGraphic,
  RMXPMoveCommand,
  RMXPMoveRoute,
} from '@utils/events/types';
import { padStr } from '@utils/PadStr';
import { isRecord } from '@utils/rmxpUtils';
import log from 'electron-log';
import fsPromise from 'fs/promises';
import path from 'path';
import { isMarshalHash, isMarshalStandardObject, Marshal, MarshalHash } from 'ts-marshal';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';
import { isMapObject } from './readRMXPMap';

// RMXP Documentation: https://www.rpg-maker.fr/dl/monos/aide/xp/index.html?page=source%2Frgss%2Frgss.html

export type ReadRMXPEventInput = { projectPath: string; mapId: number; eventIds?: number[] };
export type ReadRMXPEventOutput = { rmxpEvents: RMXPEvent[] };

type EventPageConditionData = {
  '@switch1_valid': boolean;
  '@switch2_valid': boolean;
  '@variable_valid': boolean;
  '@self_switch_valid': boolean;
  '@switch1_id': number;
  '@switch2_id': number;
  '@variable_id': number;
  '@variable_value': number;
  '@self_switch_ch': string;
};

type EventPageGraphicData = {
  '@tile_id': number;
  '@character_name': string;
  '@character_hue': number;
  '@direction': number;
  '@pattern': number;
  '@opacity': number;
  '@blend_type': number;
};

type MoveCommandData = {
  '@code': number;
  '@parameters': unknown[];
};

type MoveRouteData = {
  '@repeat': boolean;
  '@skippable': boolean;
  '@list': MoveCommandData[];
};

type EventCommandData = {
  '@code': number;
  '@indent': number;
  '@parameters': unknown[];
};

type EventPageData = {
  '@condition': EventPageConditionData;
  '@graphic': EventPageGraphicData;
  '@move_type': number;
  '@move_speed': number;
  '@move_frequency': number;
  '@move_route': MoveRouteData;
  '@walk_anime': boolean;
  '@step_anime': boolean;
  '@direction_fix': boolean;
  '@through': boolean;
  '@always_on_top': boolean;
  '@trigger': number;
  '@list': EventCommandData[];
};

type EventData = {
  '@id': number;
  '@name': string;
  '@x': number;
  '@y': number;
  '@pages': EventPageData[];
  __class: symbol;
};

const isPageConditionObject = (object: unknown): object is EventPageConditionData =>
  isMarshalStandardObject(object) &&
  '@switch1_valid' in object &&
  '@switch2_valid' in object &&
  '@variable_valid' in object &&
  '@self_switch_valid' in object &&
  '@switch1_id' in object &&
  '@switch2_id' in object &&
  '@variable_id' in object &&
  '@variable_value' in object &&
  '@self_switch_ch' in object &&
  typeof object['@switch1_valid'] === 'boolean' &&
  typeof object['@switch2_valid'] === 'boolean' &&
  typeof object['@variable_valid'] === 'boolean' &&
  typeof object['@self_switch_valid'] === 'boolean' &&
  typeof object['@switch1_id'] === 'number' &&
  typeof object['@switch2_id'] === 'number' &&
  typeof object['@variable_id'] === 'number' &&
  typeof object['@variable_value'] === 'number' &&
  typeof object['@self_switch_ch'] === 'string';

const isPageGraphicObject = (object: unknown): object is EventPageGraphicData =>
  isMarshalStandardObject(object) &&
  '@tile_id' in object &&
  '@character_name' in object &&
  '@character_hue' in object &&
  '@direction' in object &&
  '@pattern' in object &&
  '@opacity' in object &&
  '@blend_type' in object &&
  typeof object['@tile_id'] === 'number' &&
  typeof object['@character_name'] === 'string' &&
  typeof object['@character_hue'] === 'number' &&
  typeof object['@direction'] === 'number' &&
  typeof object['@pattern'] === 'number' &&
  typeof object['@opacity'] === 'number' &&
  typeof object['@blend_type'] === 'number';

const isMoveCommandObject = (object: unknown): object is MoveCommandData =>
  isMarshalStandardObject(object) &&
  '@code' in object &&
  '@parameters' in object &&
  typeof object['@code'] === 'number' &&
  typeof object['@parameters'] === 'object';

const isMoveRouteObject = (object: unknown): object is MoveRouteData =>
  isMarshalStandardObject(object) &&
  '@repeat' in object &&
  '@skippable' in object &&
  '@list' in object &&
  typeof object['@repeat'] === 'boolean' &&
  typeof object['@skippable'] === 'boolean' &&
  Array.isArray(object['@list']) &&
  object['@list'].reduce<boolean>((prev, moveCommand) => prev && isMoveCommandObject(moveCommand), true);

const isEventCommandObject = (object: unknown): object is EventCommandData =>
  isMarshalStandardObject(object) &&
  '@code' in object &&
  '@indent' in object &&
  '@parameters' in object &&
  typeof object['@code'] === 'number' &&
  typeof object['@indent'] === 'number' &&
  typeof object['@parameters'] === 'object';

const isEventPageObject = (object: unknown): object is EventPageData =>
  isMarshalStandardObject(object) &&
  '@condition' in object &&
  '@graphic' in object &&
  '@move_type' in object &&
  '@move_speed' in object &&
  '@move_frequency' in object &&
  '@move_route' in object &&
  '@walk_anime' in object &&
  '@step_anime' in object &&
  '@direction_fix' in object &&
  '@through' in object &&
  '@always_on_top' in object &&
  '@trigger' in object &&
  '@list' in object &&
  isPageConditionObject(object['@condition']) &&
  isPageGraphicObject(object['@graphic']) &&
  typeof object['@move_type'] === 'number' &&
  typeof object['@move_speed'] === 'number' &&
  typeof object['@move_frequency'] === 'number' &&
  isMoveRouteObject(object['@move_route']) &&
  typeof object['@walk_anime'] === 'boolean' &&
  typeof object['@step_anime'] === 'boolean' &&
  typeof object['@direction_fix'] === 'boolean' &&
  typeof object['@through'] === 'boolean' &&
  typeof object['@always_on_top'] === 'boolean' &&
  typeof object['@trigger'] === 'number' &&
  Array.isArray(object['@list']) &&
  object['@list'].reduce<boolean>((prev, eventCommand) => prev && isEventCommandObject(eventCommand), true);

const isEventObject = (object: unknown): object is EventData =>
  isMarshalStandardObject(object) &&
  '@id' in object &&
  '@name' in object &&
  '@x' in object &&
  '@y' in object &&
  '@pages' in object &&
  typeof object['@id'] === 'number' &&
  typeof object['@name'] === 'string' &&
  typeof object['@x'] === 'number' &&
  typeof object['@y'] === 'number' &&
  Array.isArray(object['@pages']) &&
  object['@pages'].reduce<boolean>((prev, page) => prev && isEventPageObject(page), true);

const buildCondition = (condition: EventPageConditionData): RMXPEventPageCondition => ({
  isSwitch1: condition['@switch1_valid'],
  isSwitch2: condition['@switch2_valid'],
  isVariable: condition['@variable_valid'],
  isSelfSwitch: condition['@self_switch_valid'],
  switch1Id: condition['@switch1_id'],
  switch2Id: condition['@switch2_id'],
  variableId: condition['@variable_id'],
  variableValue: condition['@variable_value'],
  selfSwitch: condition['@self_switch_ch'],
});

const buildGraphic = (graphic: EventPageGraphicData): RMXPEventPageGraphic => ({
  tileId: graphic['@tile_id'],
  characterName: graphic['@character_name'],
  characterHue: graphic['@character_hue'],
  direction: graphic['@direction'],
  pattern: graphic['@pattern'],
  opacity: graphic['@opacity'],
  blendType: graphic['@blend_type'],
});

// This function can be updated to change the parameters output format
// It depends on what the converter will need
const buildParameter = (parameter: unknown): unknown => {
  if (parameter && typeof parameter === 'object') {
    if (Array.isArray(parameter)) return buildParameters(parameter);

    return Object.entries(parameter)
      .filter(([key]) => key !== '__class')
      .map(([, value]) => buildParameter(value));
  }
  if (typeof parameter === 'symbol') return String(parameter);

  return parameter;
};

const buildParameters = (parameters: unknown[]): unknown[] => {
  return parameters.map((parameter) => buildParameter(parameter));
};

const buildMoveCommand = (moveCommands: MoveCommandData[]): RMXPMoveCommand[] =>
  moveCommands.map((moveCommand) => ({
    code: moveCommand['@code'],
    parameters: moveCommand['@parameters'],
  }));

const buildMoveRoute = (moveRoute: MoveRouteData): RMXPMoveRoute => ({
  isRepeat: moveRoute['@repeat'],
  isSkippable: moveRoute['@skippable'],
  list: buildMoveCommand(moveRoute['@list']),
});

const buildEventCommandList = (eventCommands: EventCommandData[]): RMXPEventCommand[] =>
  eventCommands.map((eventCommand) => ({
    code: eventCommand['@code'],
    indent: eventCommand['@indent'],
    parameters: buildParameters(eventCommand['@parameters']),
  }));

const buildEventPages = (pages: EventPageData[]): RMXPEventPage[] => {
  return pages.map((page) => ({
    condition: buildCondition(page['@condition']),
    graphic: buildGraphic(page['@graphic']),
    moveType: page['@move_type'],
    moveSpeed: page['@move_speed'],
    moveFrequency: page['@move_frequency'],
    moveRoute: buildMoveRoute(page['@move_route']),
    isWalkAnime: page['@walk_anime'],
    isStepAnime: page['@step_anime'],
    isDirectionFix: page['@direction_fix'],
    isThrough: page['@through'],
    isAlwaysOnTop: page['@always_on_top'],
    trigger: page['@trigger'],
    list: buildEventCommandList(page['@list']),
  }));
};

const buildRMXPEvent = (mapId: number, eventId: string, data: unknown): RMXPEvent | undefined => {
  if (!isEventObject(data)) {
    log.warn(`The event #${eventId} in the file Map${padStr(mapId, 3)}.rxdata is invalid.`);
    return undefined;
  }

  log.info(`Read event #${data['@id']} (${data['@name']})`);
  return { id: data['@id'], name: data['@name'], x: data['@x'], y: data['@y'], pages: buildEventPages(data['@pages']) };
};

const buildEvents = (eventHash: MarshalHash, mapId: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __class, __extendedModules, __default, ...events } = eventHash;
  return Object.entries(events)
    .map(([id, data]) => buildRMXPEvent(mapId, id, data))
    .filter(<T>(data: T): data is Exclude<T, undefined> => !!data);
};

const buildEvent = (eventHash: MarshalHash, mapId: number, eventId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __class, __extendedModules, __default, ...events } = eventHash;
  const data = events[eventId];
  const rmxpEvent = buildRMXPEvent(mapId, eventId, data);
  return rmxpEvent;
};

export const readRMXPEvents = async (projectPath: string, mapId: number, eventIds?: number[]): Promise<RMXPEvent[]> => {
  const mapData = await fsPromise.readFile(path.join(projectPath, 'Data', `Map${padStr(mapId, 3)}.rxdata`));
  const marshalMapData = Marshal.load(mapData);

  if (!isRecord(marshalMapData)) throw new Error('Loaded object is not a Record');
  if (!isMapObject(marshalMapData)) throw new Error(`The file Map${padStr(mapId, 3)}.rxdata is not a valid map object.`);

  const eventsData = marshalMapData['@events'];
  if (!isMarshalHash(eventsData)) throw new Error('Loaded object is not a Hash');

  if (eventIds) {
    return eventIds.map((eventId) => buildEvent(eventsData, mapId, eventId.toString())).filter(<T>(data: T): data is Exclude<T, undefined> => !!data);
  }
  return buildEvents(eventsData, mapId);
};

const readRMXPEventsBackendService = async (payload: ReadRMXPEventInput): Promise<ReadRMXPEventOutput> => {
  log.info('read-rmxp-events', payload);

  const rmxpEvents = await readRMXPEvents(payload.projectPath, payload.mapId, payload.eventIds);

  log.info('read-rmxp-events/success');
  return { rmxpEvents };
};

export const registerReadRMXPEvents = defineBackendServiceFunction('read-rmxp-events', readRMXPEventsBackendService);
