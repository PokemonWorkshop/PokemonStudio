import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';
import { Position } from '@xyflow/react';
import { CustomHandle } from './CustomHandle';
import { useHandleConnectionState } from './useHandleConnectionState';
import { IconsFromCommand } from '@components/event/EventIcon';
import React, { useMemo } from 'react';

export const BasicNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const date = useMemo(() => new Date().toLocaleString(), []);
  const { isHandleConnected } = useHandleConnectionState(id);
  const commandType = command.type;
  const color = IconsFromCommand[commandType].color;
  const isHandleRightConnected = isHandleConnected('Sright2', 'source');

  return (
    <CommandNode commandType={commandType} commentCount={2} dialogsRef={dialogsRef} hasError={true} nodeId={id} selected={selected}>
      <CustomHandle
        color={color}
        handleIsConnected={isHandleRightConnected}
        id="Sright2"
        position={Position.Right}
        type="source"
        style={{ top: '50px' }}
      />
      <span>{date}</span>
    </CommandNode>
  );
};
