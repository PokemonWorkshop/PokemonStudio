import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import {
  EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR,
  StudioEventCommandManageAccessSaveMenu,
} from '@modelEntities/event/saveCommands/manageAccessSaveMenu';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA = EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR.pick({ action: true });

export const ManageAccessSaveMenuEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandManageAccessSaveMenu>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA, command);
  const { Select } = useInputAttrsWithLabel(MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const options = useMemo(() => {
    return [
      { label: t('event_command_action_enable'), value: 'enable' },
      { label: t('event_command_action_disable'), value: 'disable' },
      { label: t('event_command_action_toggle'), value: 'toggle' },
    ];
  }, [t]);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_manage_access_save_menu`)}>
      <InputFormContainer ref={formRef}>
        <Select name="action" label={t(`event_command_action`)} options={options} />
      </InputFormContainer>
    </Editor>
  );
});

ManageAccessSaveMenuEditor.displayName = 'ManageAccessSaveMenuEditor';
