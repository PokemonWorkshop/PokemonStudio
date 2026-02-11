import { Handle, Position } from '@xyflow/react';
import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';
import React, { useMemo } from 'react';

export const BasicNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const date = useMemo(() => new Date().toLocaleString(), []);
  const commandType = command.type;

  return (
    <>
      <Handle type="target" position={Position.Left} id="Tleft" />
      <Handle type="source" position={Position.Right} id="Sright1" style={{ top: '25%' }} />
      <Handle type="source" position={Position.Right} id="Sright2" style={{ top: '75%' }} />
      <CommandNode commandType={commandType} commentCount={0} dialogsRef={dialogsRef} hasError={false} nodeId={id} selected={selected}>
        <span>{date}</span>
      </CommandNode>
    </>
  );
};
