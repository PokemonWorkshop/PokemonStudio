import { InputFormContainer } from '@components/inputs/InputContainer';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import {
  EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR,
  StudioEventWaitMovementCompletion,
} from '@modelEntities/event/movementCommands/waitMovementCompletion';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { useEventData } from '../../../common/EventContext';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';
import { useSharedOptions } from '../../sharedSelectOptions';

const WAIT_EDITOR_SCHEMA = EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR.pick({
  waitAllEvents: true,
}).extend({
  waitAllEvents: z.enum(['all', 'some']),
  waitById: z.array(z.string()).optional(),
});

export const WaitMovementCompletionCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventWaitMovementCompletion>(id);
  const { globalStaticEvent } = useSharedOptions();
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventWaitMovementCompletion>;
  const { event } = useEventData();

  const commandDataForForm = useMemo(
    () => ({
      ...commandData,
      waitAllEvents: (commandData.waitAllEvents ? 'all' : 'some') as 'all' | 'some',
    }),
    [commandData],
  );

  const { canClose, getFormData, defaults, formRef } = useZodForm(WAIT_EDITOR_SCHEMA, commandDataForForm);
  const { Select, MultiSelect } = useNodeInputAttrsWithLabel(WAIT_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const [waitEvent, setWaitEvent] = useState<string>(commandData.waitAllEvents ? 'all' : 'some');

  const waitEventOptions = useMemo(() => {
    return [
      { label: t('event_command_wait_move_completion_select_all'), value: 'all' },
      { label: t('event_command_wait_move_completion_select_some'), value: 'some' },
    ];
  }, [t]);

  const eventToWaitOptions = useMemo(
    () => [
      ...globalStaticEvent(),
      {
        label: t('event_command_wait_move_completion_multiselect_static_this_event'),
        value: event?.dbSymbol as string,
      },
    ],
    [event?.dbSymbol],
  );

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand({
      ...result.data,
      waitAllEvents: result.data.waitAllEvents === 'all',
      waitById: waitEvent === 'all' ? [] : result.data.waitById,
    });
  };

  const onWaitAllEventChange = (value: string) => {
    setWaitEvent(value);

    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand({
      ...result.data,
      waitAllEvents: value === 'all',
      waitById: waitEvent === 'all' ? [] : result.data.waitById,
    });
  };

  useEffect(() => {
    setWaitEvent(commandData.waitAllEvents ? 'all' : 'some');
  }, [commandData.waitAllEvents]);

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputFormContainer ref={formRef} onBlur={onBlur} key={id}>
        <Select
          name="waitAllEvents"
          label={t('event_command_wait_move_completion_select')}
          options={waitEventOptions}
          value={waitEvent}
          className="nodrag nowheel"
          onChange={onWaitAllEventChange}
          defaultValue={undefined}
        />

        {waitEvent === 'some' && (
          <MultiSelect
            name="waitById"
            label={t('event_command_wait_move_completion_multiselect_label')}
            options={eventToWaitOptions}
            value={commandData.waitById}
            className="nodrag nowheel"
          />
        )}
      </InputFormContainer>
    </CommandNode>
  );
};
