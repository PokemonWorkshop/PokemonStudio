import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_COMPLETE_QUEST_VALIDATOR, StudioEventCommandCompleteQuest } from '@modelEntities/event/questCommands/completeQuest';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const COMPLETE_QUEST_EDITOR_SCHEMA = EVENT_COMMAND_COMPLETE_QUEST_VALIDATOR.pick({ quests: true });

export const CompleteQuestEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandCompleteQuest>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(COMPLETE_QUEST_EDITOR_SCHEMA, command);
  const { MultiSelect } = useInputAttrsWithLabel(COMPLETE_QUEST_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const questOptions = useSelectOptions('quests');

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('event_command_complete_quest')}>
      <InputFormContainer ref={formRef}>
        <MultiSelect name="quests" label={t('event_command_quests_to_complete')} options={questOptions} value={command.quests} />
      </InputFormContainer>
    </Editor>
  );
});

CompleteQuestEditor.displayName = 'CompleteQuestEditor';
