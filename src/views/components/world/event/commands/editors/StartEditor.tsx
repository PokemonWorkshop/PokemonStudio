import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { Select as DsSelect } from '@ds/Select';
import { EVENT_COMMAND_START_VALIDATOR, START_TRIGGERS, StudioEventCommandStart } from '@modelEntities/event/commands/start';
import { StudioEvent } from '@modelEntities/event/event';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';

const START_EDITOR_SCHEMA = EVENT_COMMAND_START_VALIDATOR.pick({ trigger: true, priority: true });

const countStartCommand = (event: StudioEvent) => {
  const commands = Object.values(event.commands);
  return commands.filter((command) => !!command && command.type === 'start').length;
};

export const StartEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandStart>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(START_EDITOR_SCHEMA, command);
  const { Input, Select } = useInputAttrsWithLabel(START_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const triggerOptions = useMemo(() => START_TRIGGERS.map((trigger) => ({ value: trigger, label: t(`event_command_trigger_${trigger}`) })), [t]);
  const priorityOptions = useMemo(
    () => Array.from({ length: countStartCommand(event) }, (_, i) => ({ value: `${i + 1}`, label: `#${i + 1}` })),
    [event],
  );
  const priorityRef = useRef<HTMLInputElement>(null);

  const onPriorityChange = (option: string) => {
    if (!priorityRef.current) return;

    priorityRef.current.valueAsNumber = Number(option);
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_start`)}>
      <InputFormContainer ref={formRef}>
        <Select name="trigger" label={t(`event_command_trigger`)} options={triggerOptions} />
        <Input name="priority" ref={priorityRef} style={{ display: 'none' }} />
        <InputWithTopLabelContainer>
          <Label>{t(`event_command_priority`)}</Label>
          <DsSelect options={priorityOptions} onChange={onPriorityChange} defaultValue={defaults['priority']} />
        </InputWithTopLabelContainer>
      </InputFormContainer>
    </Editor>
  );
});

StartEditor.displayName = 'StartEditor';
