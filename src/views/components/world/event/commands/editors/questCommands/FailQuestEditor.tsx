import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_FAIL_QUEST_VALIDATOR, StudioEventCommandFailQuest } from '@modelEntities/event/questCommands/failQuest';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const FAIL_QUEST_EDITOR_SCHEMA = EVENT_COMMAND_FAIL_QUEST_VALIDATOR.pick({ quests: true });

export const FailQuestEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandFailQuest>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(FAIL_QUEST_EDITOR_SCHEMA, command);
  const { MultiSelect } = useInputAttrsWithLabel(FAIL_QUEST_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const questOptions = useSelectOptions('quests');

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('event_command_fail_quest')}>
      <InputFormContainer ref={formRef}>
        <MultiSelect name="quests" label={t('event_command_quests_to_fail')} options={questOptions} value={command.quests} />
      </InputFormContainer>
    </Editor>
  );
});

FailQuestEditor.displayName = 'FailQuestEditor';
