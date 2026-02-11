import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { Handle, Position } from '@xyflow/react';
import { Input, MultiLineInput } from '@components/inputs';
import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';

export const InsertScriptNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const { t } = useTranslation();
  const { type: commandType, comment, script } = command as StudioEventCommandInsertScript;

  return (
    <>
      <Handle type="target" position={Position.Left} id="Tleft" />
      <Handle type="source" position={Position.Right} id="Sright" />
      <CommandNode commandType={commandType} commentCount={0} dialogsRef={dialogsRef} hasError={true} nodeId={id} selected={selected}>
        <span>{t(`event_command_comment`)}</span>
        <Input value={comment} readOnly />
        <span>{t(`event_command_script`)}</span>
        <MultiLineInput value={script} readOnly />
      </CommandNode>
    </>
  );
};
