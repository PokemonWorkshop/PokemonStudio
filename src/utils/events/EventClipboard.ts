import type { StudioEventCommand } from '@modelEntities/event/command';
import type { CommandId } from '@modelEntities/event/globalCommand';

export type EventClipboardEntry = {
  originalId: CommandId;
  command: StudioEventCommand;
};

export type EventClipboardData = {
  sourceCsvFileId: number;
  entries: EventClipboardEntry[];
};

let clipboard: EventClipboardData | undefined;

export const setEventClipboard = (data: EventClipboardData) => {
  clipboard = data;
};

export const getEventClipboard = (): EventClipboardData | undefined => clipboard;
export const hasEventClipboard = (): boolean => !!clipboard && clipboard.entries.length > 0;
