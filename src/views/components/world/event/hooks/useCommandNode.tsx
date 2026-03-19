import { useEventActions } from '@components/world/event/generic/EventContext';
import { CommandNode } from '../generic/CommandNode';
import { CommandId, StudioEventCommand } from '@modelEntities/event/command';
import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';

export const useCommandNode = <T extends StudioEventCommand>(id: string) => {
  const { setCurrentEditedNode, updateEvent } = useEventActions();
  const commandId = id as CommandId;

  const updateCommand = useCallback(
    (command: Partial<T>) => {
      updateEvent((currentEvent) => {
        const commandsEdited = cloneEntity(currentEvent.commands);
        commandsEdited[commandId] = { ...commandsEdited[commandId], ...command } as T;
        return { commands: commandsEdited };
      });
      setCurrentEditedNode(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commandId],
  );

  return {
    CommandNode,
    updateCommand,
  };
};
