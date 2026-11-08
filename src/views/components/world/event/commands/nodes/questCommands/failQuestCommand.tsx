import { InputFormContainer } from '@components/inputs/InputContainer';
import { useSelectOptions } from '@hooks/useSelectOptions';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { EVENT_COMMAND_FAIL_QUEST_VALIDATOR, StudioEventCommandFailQuest } from '@modelEntities/event/questCommands/failQuest';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const FAIL_QUEST_EDITOR_SCHEMA = EVENT_COMMAND_FAIL_QUEST_VALIDATOR.pick({ quests: true });

export const FailQuestCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandFailQuest>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandFailQuest>;
  const { canClose, getFormData, defaults, formRef } = useZodForm(FAIL_QUEST_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(FAIL_QUEST_EDITOR_SCHEMA, defaults);
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
          label={t('event_command_quests_to_fail')}
          options={questOptions}
          value={commandData.quests}
          className="nodrag nowheel"
        />
      </InputFormContainer>
    </CommandNode>
  );
};
