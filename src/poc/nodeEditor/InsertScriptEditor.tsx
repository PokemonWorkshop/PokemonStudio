import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTranslation } from 'react-i18next';
import { EventEditorProps } from './EventEditorProps';
import { EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR, StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { useZodForm } from '@src/hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useCommandEditor } from '../eventEditor/useCommandEditor';
import React, { forwardRef } from 'react';

const INSERT_SCRIPT_EDITOR_SCHEMA = EVENT_COMMAND_INSERT_SCRIPT_VALIDATOR.pick({ script: true });

export const InsertScriptEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandInsertScript>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(INSERT_SCRIPT_EDITOR_SCHEMA, command);
  const { MultiLineInput } = useInputAttrsWithLabel(INSERT_SCRIPT_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_insert_script`)}>
      <InputFormContainer ref={formRef}>
        <MultiLineInput name="script" label={t(`event_command_script`)} />
      </InputFormContainer>
    </Editor>
  );
});

InsertScriptEditor.displayName = 'InsertScriptEditor';
