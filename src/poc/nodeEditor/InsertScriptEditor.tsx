import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTranslation } from 'react-i18next';
import { EventEditorProps } from './EventEditorProps';
import { useUpdateEvent } from '../eventEditor/useUpdateEvent';
import { EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR, StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo } from 'react';
import { cloneEntity } from '@utils/cloneEntity';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';

const INSERT_SCRIPT_EDITOR_SCHEMA = EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR.pick({ comment: true, script: true });

export const InsertScriptEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const commandId = useMemo(() => defaultCommandId, []);
  if (!commandId) throw new Error(`The command doesn't exist in the event ${event.dbSymbol}`);

  const command = event.commandLists[commandId];
  if (!command) throw new Error(`${commandId} doesn't exist in the event ${event.dbSymbol}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { commandType: _, ...commandData } = command;
  const { canClose, getFormData, defaults, formRef } = useZodForm(INSERT_SCRIPT_EDITOR_SCHEMA, commandData);
  const { Input } = useInputAttrsWithLabel(INSERT_SCRIPT_EDITOR_SCHEMA, defaults);
  const updateEvent = useUpdateEvent(event);
  const { t } = useTranslation();

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    const commandListsEdited = cloneEntity(event.commandLists);
    commandListsEdited[commandId] = { ...commandListsEdited[commandId], ...result.data } as StudioEventCommandInsertScript;
    updateEvent({ commandLists: commandListsEdited });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  // TODO: add MultiInput in useInputAttrsWithLabel
  return (
    <Editor type="edit" title={t(`event_command_insert_script`)}>
      <InputFormContainer ref={formRef}>
        <Input name="comment" label="Comment" />
        <Input name="script" label="Script" />
      </InputFormContainer>
    </Editor>
  );
});

InsertScriptEditor.displayName = 'InsertScriptEditor';
