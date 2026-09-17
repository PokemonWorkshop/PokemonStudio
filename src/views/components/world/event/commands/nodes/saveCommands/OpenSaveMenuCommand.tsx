import type { StudioEventCommandData } from '@modelEntities/event/command';
import type { StudioEventCommandOpenSaveMenu } from '@modelEntities/event/saveCommands/openSaveMenu';
import React from 'react';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

export const OpenSaveMenuCommand = ({ id, data: { dialogsRef: commandDialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandOpenSaveMenu>(id);
  const { type: commandType } = command as StudioEventCommandData<StudioEventCommandOpenSaveMenu>;

  return (
    <>
      <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={commandDialogsRef} nodeId={id} selected={selected}>
        <></>
      </CommandNode>
    </>
  );
};
