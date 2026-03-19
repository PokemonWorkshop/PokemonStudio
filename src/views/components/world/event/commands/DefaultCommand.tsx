import { EventNodeProps } from './EventNodeProps';
import { useHandleConnectionState } from '../hooks/useHandleConnectionState';
import { IconsFromCommand } from '../generic/EventIcon';
import { CommandNode } from '../generic/CommandNode';
import { CustomHandle } from '../generic/CustomHandle';
import { Position } from '@xyflow/react';
import React from 'react';

export const DefaultCommand = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  //const date = useMemo(() => new Date().toLocaleString(), []);
  const date = new Date().toLocaleString();
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
