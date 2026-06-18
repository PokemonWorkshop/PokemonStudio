import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_START_VALIDATOR, StudioEventCommandStart } from '@modelEntities/event/commands/start';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';

const START_EDITOR_SCHEMA = EVENT_COMMAND_START_VALIDATOR.pick({ priority: true });

export const StartEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandStart>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(START_EDITOR_SCHEMA, command);
  const { Input } = useInputAttrsWithLabel(START_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_start`)}>
      <InputFormContainer ref={formRef}>
        <Input name="priority" label={t(`event_command_priority`)} labelLeft />
      </InputFormContainer>
    </Editor>
  );
});

StartEditor.displayName = 'StartEditor';
