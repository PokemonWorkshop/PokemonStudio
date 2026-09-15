import type { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioEventTree } from '@modelEntities/event/event-tree';
import { ProjectData, ProjectText } from '@src/GlobalStateProvider';
import type { RMXPEvent } from '@utils/events/types';

export type PreStateEventConvert = {
  events: ProjectData['events'];
  eventTree: StudioEventTree;
  projectText: ProjectText;
};

export type EventConvertFailureCallback = (errorMessage: string) => void;
export type EventConvertSuccessCallback = (payload: Record<string, never>) => void;
export type EventConvertStateObject =
  | { state: 'done' }
  | { state: 'read'; mapId: number; eventIds?: number[] }
  | {
      state: 'createEvents';
      rmxpEvents: RMXPEvent[];
      rmxpEventIdsToDbSymbols: Record<number, DbSymbol>;
      eventIndex: number;
      preState: PreStateEventConvert;
    }
  | {
      state: 'createCommands';
      rmxpEvents: RMXPEvent[];
      rmxpEventIdsToDbSymbols: Record<number, DbSymbol>;
      preState: PreStateEventConvert;
    };
export type EventConvertFunctionBinding = {
  onSuccess: EventConvertSuccessCallback;
  onFailure: EventConvertFailureCallback;
};
