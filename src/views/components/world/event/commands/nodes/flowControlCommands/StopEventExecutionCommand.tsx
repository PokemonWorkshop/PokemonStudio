import type { StudioEventCommandStopEventExecution } from '@modelEntities/event/flowControlCommands/stopEventExecution';
import React from 'react';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

export const StopEventExecutionCommand = ({ id, data: { dialogsRef, comments }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandStopEventExecution>(id);

  return (
    <CommandNode
      commandType="stop_event_execution"
      commentCount={comments.length}
      dialogsRef={dialogsRef}
      nodeId={id}
      selected={selected}
      defaultHandles={{ left: true, right: false }}
    >
      {null}
    </CommandNode>
  );
};
