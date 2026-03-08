import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';
import React, { useMemo } from 'react';

export const BasicNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const date = useMemo(() => new Date().toLocaleString(), []);
  const commandType = command.type;

  return (
    <>
      {/*<Handle type="source" position={Position.Right} id="Sright2" style={{ top: '75%' }} />*/}
      <CommandNode commandType={commandType} commentCount={2} dialogsRef={dialogsRef} hasError={true} nodeId={id} selected={selected}>
        <span>{date}</span>
      </CommandNode>
    </>
  );
};
