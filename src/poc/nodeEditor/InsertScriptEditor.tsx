import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTranslation } from 'react-i18next';
import { EventEditorProps } from './EventEditorProps';
import { useUpdateEvent } from '../eventEditor/useUpdateEvent';
import { EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR, StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { useZodForm } from '@src/hooks/useZodForm';
import { cloneEntity } from '@utils/cloneEntity';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useCommandEditor } from '../eventEditor/useCommandEditor';
import React, { forwardRef } from 'react';

const INSERT_SCRIPT_EDITOR_SCHEMA = EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR.pick({ comment: true, script: true });

export const InsertScriptEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { commandId, command } = useCommandEditor(event, defaultCommandId);
  const updateEvent = useUpdateEvent(event);
  const { canClose, getFormData, defaults, formRef } = useZodForm(INSERT_SCRIPT_EDITOR_SCHEMA, command);
  const { Input, MultiLineInput } = useInputAttrsWithLabel(INSERT_SCRIPT_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    const commandsEdited = cloneEntity(event.commands);
    commandsEdited[commandId] = { ...commandsEdited[commandId], ...result.data } as StudioEventCommandInsertScript;
    updateEvent({ commands: commandsEdited });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_insert_script`)}>
      <InputFormContainer ref={formRef}>
        <Input name="comment" label={t(`event_command_comment`)} />
        <MultiLineInput name="script" label={t(`event_command_script`)} />
      </InputFormContainer>
    </Editor>
  );
});

InsertScriptEditor.displayName = 'InsertScriptEditor';
