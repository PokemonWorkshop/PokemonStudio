import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR, StudioEventCommandData, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';

const SHOW_MESSAGE_EDITOR_SCHEMA = EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR.pick({ narrator: true, message: true });

export const ShowMessageCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandShowMessage>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandShowMessage>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(SHOW_MESSAGE_EDITOR_SCHEMA, commandData);
  const { Input, MultiLineInput } = useNodeInputAttrsWithLabel(SHOW_MESSAGE_EDITOR_SCHEMA, defaults);
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
        <Input name="narrator" label={t('event_command_narrator')} className="nodrag" placeholder={t('event_command_narrator_placeholder')} />
        <MultiLineInput name="message" label={t('event_command_message')} className="nodrag" placeholder={t('event_command_message_placeholder')} />
      </InputFormContainer>
    </CommandNode>
  );
};
