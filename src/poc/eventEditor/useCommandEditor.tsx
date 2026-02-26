import type { CommandId } from '@modelEntities/event/command';
import type { StudioEvent } from '@modelEntities/event/event';
import { useMemo } from 'react';

export const useCommandEditor = (event: StudioEvent, defaultCommandId?: CommandId) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commandId = useMemo(() => defaultCommandId, []);
  if (!commandId) throw new Error(`The command doesn't exist in the event ${event.dbSymbol}`);

  const command = event.commands[commandId];
  if (!command) throw new Error(`${commandId} doesn't exist in the event ${event.dbSymbol}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, connections, studioData, ...commandData } = command;

  return {
    commandId,
    command: commandData,
  };
};
