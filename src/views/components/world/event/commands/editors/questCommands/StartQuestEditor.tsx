import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { EVENT_COMMAND_START_QUEST_VALIDATOR, StudioEventCommandStartQuest } from '@modelEntities/event/questCommands/startQuest';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const START_QUEST_EDITOR_SCHEMA = EVENT_COMMAND_START_QUEST_VALIDATOR.pick({ quests: true });

export const StartQuestEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandStartQuest>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(START_QUEST_EDITOR_SCHEMA, command);
  const { MultiSelect } = useInputAttrsWithLabel(START_QUEST_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const questOptions = useSelectOptions('quests');

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('event_command_start_quest')}>
      <InputFormContainer ref={formRef}>
        <MultiSelect name="quests" label={t('event_command_quests_to_start')} options={questOptions} value={command.quests} required />
      </InputFormContainer>
    </Editor>
  );
});

StartQuestEditor.displayName = 'StartQuestEditor';
