import { CommandNodeProps } from './CommandNodeProps';
import { useHandleConnectionState } from '../hooks/useHandleConnectionState';
import { IconsFromCommand } from '../common/EventIcon';
import { CommandNode } from '../common/CommandNode';
import { CustomHandle } from '../common/CustomHandle';
import { Position } from '@xyflow/react';
import React from 'react';

export const DefaultCommand = ({ id, data: { dialogsRef, command }, selected }: CommandNodeProps) => {
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
