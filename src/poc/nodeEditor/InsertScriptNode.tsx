import { useTranslation } from 'react-i18next';
import type { StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { InputWithTopLabelContainer } from '@components/inputs';
import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';
import { NodeMultiLineInput } from './InputNode';
import React from 'react';

export const InsertScriptNode = ({ id, data: { dialogsRef, command, comments }, selected }: EventNodeProps) => {
  const { t } = useTranslation();
  const { type: commandType, script } = command as Exclude<StudioEventCommandInsertScript, 'connections' | 'studioData'>;

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputWithTopLabelContainer>
        <span>{t(`event_command_script`)}</span>
        <NodeMultiLineInput value={script} readOnly />
      </InputWithTopLabelContainer>
    </CommandNode>
  );
};
