import { InputFormContainer } from '@components/inputs/InputContainer';
import { StudioEventCommandData } from '@modelEntities/event/command';
import { EVENT_COMMAND_START_VALIDATOR, START_TRIGGERS, StudioEventCommandStart } from '@modelEntities/event/commands/start';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';

const START_EDITOR_SCHEMA = EVENT_COMMAND_START_VALIDATOR.pick({ trigger: true });

type PriorityStartCommandProps = { priority: number };

const PriorityStartCommand = ({ priority }: PriorityStartCommandProps) => {
  return <div className="nodrag">{priority}</div>;
};

export const StartCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandStart>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandStart>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(START_EDITOR_SCHEMA, commandData);
  const { Select } = useInputAttrsWithLabel(START_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const triggerOptions = useMemo(() => START_TRIGGERS.map((trigger) => ({ value: trigger, label: t(trigger) })), [t]);

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
    <CommandNode
      commandType={commandType}
      commentCount={comments.length}
      dialogsRef={dialogsRef}
      nodeId={id}
      selected={selected}
      defaultHandles={{ left: false, right: true }}
      footerChildren={<PriorityStartCommand priority={commandData.priority} />}
    >
      <InputFormContainer ref={formRef} onBlur={onBlur}>
        <Select name="trigger" label={t(`event_command_trigger`)} className="nodrag" options={triggerOptions} />
      </InputFormContainer>
    </CommandNode>
  );
};
