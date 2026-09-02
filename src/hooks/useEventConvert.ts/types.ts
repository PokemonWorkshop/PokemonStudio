import type { DbSymbol } from '@modelEntities/dbSymbol';
import type { RMXPEvent } from '@utils/events/types';

export type EventConvertGenericFailureCallback = (genericError: string) => void;
export type EventConvertFailureCallback = (errorMessage: string) => void;
export type EventConvertSuccessCallback = (payload: Record<string, never>) => void;
export type EventConvertStateObject =
  | { state: 'done' }
  | { state: 'read'; mapId: number; eventIds?: number[] }
  | { state: 'createEvents'; rmxpEvents: RMXPEvent[] }
  | { state: 'createTriggers'; rmxpEvents: RMXPEvent[]; rmxpEvent: RMXPEvent; eventDbSymbol: DbSymbol; pageIndex: number }
  | { state: 'createCommands'; rmxpEvents: RMXPEvent[]; rmxpEvent: RMXPEvent; eventDbSymbol: DbSymbol; pageIndex: number; commandIndex: number };
export type EventConvertFunctionBinding = {
  onSuccess: EventConvertSuccessCallback;
  onFailure: EventConvertFailureCallback;
  onGenericFailure: EventConvertGenericFailureCallback;
};
