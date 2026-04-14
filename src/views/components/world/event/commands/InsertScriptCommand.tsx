import { useTranslation } from 'react-i18next';
import { EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR, StudioEventCommandData, type StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { CommandNodeProps } from './CommandNodeProps';
import { useCommandNode } from '../hooks/useCommandNode';
import { useZodForm } from '@src/hooks/useZodForm';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import React, { useEffect } from 'react';

const INSERT_SCRIPT_EDITOR_SCHEMA = EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR.pick({ script: true });

export const InsertScriptCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandInsertScript>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandInsertScript>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(INSERT_SCRIPT_EDITOR_SCHEMA, commandData);
  const { MultiLineInput } = useNodeInputAttrsWithLabel(INSERT_SCRIPT_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  useEffect(() => {
    reload(commandData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputFormContainer ref={formRef} onBlur={onBlur}>
        <MultiLineInput name="script" label={t(`event_command_script`)} className="nodrag" />
      </InputFormContainer>
    </CommandNode>
  );
};
