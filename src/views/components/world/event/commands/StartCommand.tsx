import PriorityIcon from '@assets/icons/global/priority-icon.svg';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { StudioEventCommandData } from '@modelEntities/event/command';
import { EVENT_COMMAND_START_VALIDATOR, START_TRIGGERS, StudioEventCommandStart } from '@modelEntities/event/commands/start';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEventActions } from '../common/EventContext';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';
import { CommandDialogsRef } from './editors/CommandEditorOverlay';

const START_EDITOR_SCHEMA = EVENT_COMMAND_START_VALIDATOR.pick({ trigger: true });

type PriorityStartCommandProps = { priority: number; nodeId: string; dialogsRef?: CommandDialogsRef };

const PriorityStartCommand = ({ priority, nodeId, dialogsRef }: PriorityStartCommandProps) => {
  const { setCurrentEditedNode } = useEventActions();

  const onClickPriority = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setCurrentEditedNode(nodeId);
    dialogsRef?.current?.openDialog('start');
  };

  return (
    <div className="comments nodrag" onClick={onClickPriority} onDoubleClick={(e) => e.stopPropagation()}>
      <div className="icon-container">
        <PriorityIcon className="icon" />
      </div>
      <span className="count">#{priority}</span>
    </div>
  );
};

export const StartCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandStart>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandStart>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(START_EDITOR_SCHEMA, commandData);
  const { Select } = useNodeInputAttrsWithLabel(START_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const triggerOptions = useMemo(() => START_TRIGGERS.map((trigger) => ({ value: trigger, label: t(`event_command_trigger_${trigger}`) })), [t]);
  const [trigger, setTrigger] = useState(defaults['trigger']);

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  useEffect(() => {
    reload(commandData);
    setTrigger(commandData['trigger']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  return (
    <CommandNode
      commandType={commandType}
      commentCount={comments.length}
      dialogsRef={dialogsRef}
      nodeId={id}
      selected={selected}
      defaultHandles={{ left: false, right: true }}
      footerChildren={<PriorityStartCommand priority={commandData.priority} nodeId={id} dialogsRef={dialogsRef} />}
    >
      <InputFormContainer ref={formRef} onBlur={onBlur}>
        <Select
          name="trigger"
          label={t(`event_command_trigger`)}
          options={triggerOptions}
          onChange={(value) => setTrigger(value)}
          value={trigger}
          defaultValue={undefined}
        />
      </InputFormContainer>
    </CommandNode>
  );
};
