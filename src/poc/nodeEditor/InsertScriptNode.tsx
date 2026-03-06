import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { InputWithTopLabelContainer, MultiLineInput } from '@components/inputs';
import { EventNodeProps } from './EventNodeProps';
import { CommandNode } from './CommandNode';

export const InsertScriptNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const { t } = useTranslation();
  const {
    type: commandType,
    script,
    studioData: { comments },
  } = command as StudioEventCommandInsertScript;

  return (
    <>
      <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} hasError={false} nodeId={id} selected={selected}>
        <InputWithTopLabelContainer>
          <span>{t(`event_command_script`)}</span>
          <MultiLineInput value={script} readOnly />
        </InputWithTopLabelContainer>
      </CommandNode>
    </>
  );
};
