import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';

const SHOW_MESSAGE_EDITOR_SCHEMA = EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR.pick({
  message: true,
  allowSkipping: true,
  narrator: true,
  nameColor: true,
  showMessageBox: true,
  messageBoxPosition: true,
  messageBoxAppearance: true,
  lookAtThisEvent: true,
  lookToOtherEvent: true,
  minimap: true,
  mugshots: true,
});

export const ShowMessageEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandShowMessage>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(SHOW_MESSAGE_EDITOR_SCHEMA, command);
  const { Input, MultiLineInput, Toggle } = useInputAttrsWithLabel(SHOW_MESSAGE_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_show_message`)}>
      <InputFormContainer ref={formRef}>
        <MultiLineInput name="message" label={t('event_command_message')} placeholder={t('event_command_message_placeholder')} />
        <Toggle name="allowSkipping" label={t('event_command_allow_skipping')} />
        <Input name="narrator" label={t('event_command_narrator')} placeholder={t('event_command_narrator_placeholder')} />
      </InputFormContainer>
    </Editor>
  );
});

ShowMessageEditor.displayName = 'ShowMessageEditor';
