import { useEventActions } from '@components/world/event/common/EventContext';
import { StudioEventCommand } from '@modelEntities/event/command';
import { CommandId } from '@modelEntities/event/globalCommand';
import { cloneEntity } from '@utils/cloneEntity';
import { useCallback } from 'react';
import { CommandNode } from '../common/CommandNode';

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
