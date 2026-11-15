import { InputFormContainer } from '@components/inputs/InputContainer';
import { useSelectOptions } from '@hooks/useSelectOptions';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import type { StudioEventCommandCompleteQuest } from '@modelEntities/event/questCommands/completeQuest';
import { EVENT_COMMAND_COMPLETE_QUEST_VALIDATOR } from '@modelEntities/event/questCommands/completeQuest';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const COMPLETE_QUEST_EDITOR_SCHEMA = EVENT_COMMAND_COMPLETE_QUEST_VALIDATOR.pick({ quests: true });

export const CompleteQuestCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandCompleteQuest>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandCompleteQuest>;
  const { canClose, getFormData, defaults, formRef } = useZodForm(COMPLETE_QUEST_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(COMPLETE_QUEST_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const questOptions = useSelectOptions('quests');

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputFormContainer ref={formRef} onBlur={onBlur} key={id}>
        <MultiSelect
          name="quests"
          label={t('event_command_quests_to_complete')}
          options={questOptions}
          value={commandData.quests}
          className="nodrag nowheel"
        />
      </InputFormContainer>
    </CommandNode>
  );
};
