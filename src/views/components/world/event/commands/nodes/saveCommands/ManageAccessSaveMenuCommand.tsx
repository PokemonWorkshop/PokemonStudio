import { InputFormContainer } from '@components/inputs/InputContainer';
import { StudioEventCommandData } from '@modelEntities/event/command';
import {
  EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR,
  StudioEventCommandManageAccessSaveMenu,
} from '@modelEntities/event/saveCommands/manageAccessSaveMenu';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA = EVENT_COMMAND_MANAGE_ACCESS_SAVE_MENU_VALIDATOR.pick({ action: true });

export const ManageAccessSaveMenuCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandManageAccessSaveMenu>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandManageAccessSaveMenu>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA, commandData);
  const { Select } = useNodeInputAttrsWithLabel(MANAGE_ACCESS_SAVE_MENU_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [action, setAction] = useState(defaults['action']);

  const options = useMemo(() => {
    return [
      { label: t('event_command_action_enable'), value: 'enable' },
      { label: t('event_command_action_disable'), value: 'disable' },
      { label: t('event_command_action_toggle'), value: 'toggle' },
    ];
  }, [t]);

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  useEffect(() => {
    reload(commandData);
    setAction(commandData['action']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputFormContainer ref={formRef} onBlur={onBlur}>
        <Select
          name="action"
          label={t(`event_command_action`)}
          options={options}
          value={action}
          onChange={(value) => setAction(value)}
          defaultValue={undefined}
        />
      </InputFormContainer>
    </CommandNode>
  );
};
