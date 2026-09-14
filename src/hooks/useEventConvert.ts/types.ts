import type { DbSymbol } from '@modelEntities/dbSymbol';
import type { ConversionData, RMXPEvent } from '@utils/events/types';

export type EventConvertFailureCallback = (errorMessage: string) => void;
export type EventConvertSuccessCallback = (payload: Record<string, never>) => void;
export type EventConvertStateObject =
  | { state: 'done' }
  | { state: 'read'; mapId: number; eventIds?: number[] }
  | { state: 'createEvents'; rmxpEvents: RMXPEvent[]; rmxpEventIdsToDbSymbols: Record<number, DbSymbol>; eventIndex: number }
  | {
      state: 'createTriggers';
      rmxpEvents: RMXPEvent[];
      rmxpEventIdsToDbSymbols: Record<number, DbSymbol>;
      eventIndex: number;
      pageIndex: number;
      conversionData: ConversionData;
    }
  | {
      state: 'createCommands';
      rmxpEvents: RMXPEvent[];
      rmxpEventIdsToDbSymbols: Record<number, DbSymbol>;
      eventIndex: number;
      pageIndex: number;
      commandIndex: number;
      conversionData: ConversionData;
    };
export type EventConvertFunctionBinding = {
  onSuccess: EventConvertSuccessCallback;
  onFailure: EventConvertFailureCallback;
};
