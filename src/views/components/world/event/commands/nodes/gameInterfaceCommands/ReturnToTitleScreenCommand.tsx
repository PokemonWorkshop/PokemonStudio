import type { StudioEventCommandData } from '@modelEntities/event/command';
import type { StudioEventCommandReturnToTitleScreen } from '@modelEntities/event/gameInterfaceCommands/returnToTitleScreen';
import React from 'react';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

export const ReturnToTitleScreenCommand = ({ id, data: { dialogsRef: commandDialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandReturnToTitleScreen>(id);
  const { type: commandType } = command as StudioEventCommandData<StudioEventCommandReturnToTitleScreen>;

  return (
    <>
      <CommandNode
        commandType={commandType}
        commentCount={comments.length}
        dialogsRef={commandDialogsRef}
        nodeId={id}
        selected={selected}
        defaultHandles={{ left: true, right: false }}
      >
        <></>
      </CommandNode>
    </>
  );
};
