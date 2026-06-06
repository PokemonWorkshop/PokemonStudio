import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { useNodeInputAttrsWithLabel } from '../../../../../../../hooks/useInputAttrs';
import { useZodForm } from '../../../../../../../hooks/useZodForm';
import { StudioEventCommandData } from '../../../../../../../models/entities/event/command';
import {
  EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR,
  StudioEventWaitMovementCompletion,
} from '../../../../../../../models/entities/event/waitCommand/waitMovementCompletion';
import { InputFormContainer } from '../../../../../inputs/InputContainer';
import { useEventData } from '../../../common/EventContext';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';
import { useSharedOptions } from '../../sharedSelectOptions';

const WAIT_EDITOR_SCHEMA = EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR.pick({
  waitAllevent: true,
}).extend({
  waitAllevent: z.enum(['all', 'some']),
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
      waitAllevent: (commandData.waitAllevent ? 'all' : 'some') as 'all' | 'some',
    }),
    [commandData],
  );

  const { canClose, getFormData, defaults, formRef } = useZodForm(WAIT_EDITOR_SCHEMA, commandDataForForm);
  const { Select, MultiSelect } = useNodeInputAttrsWithLabel(WAIT_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const [waitEvent, setWaitEvent] = useState<string>(commandData.waitAllevent ? 'all' : 'some');

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
    console.log('save', result.data, getFormData);

    updateCommand({
      ...result.data,
      waitAllevent: result.data.waitAllevent === 'all',
    });
  };

  const onWaitAllEventChange = (value: string) => {
    setWaitEvent(value);

    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand({
      ...result.data,
      waitAllevent: value === 'all',
    });
  };

  useEffect(() => {
    setWaitEvent(commandData.waitAllevent ? 'all' : 'some');
  }, [commandData.waitAllevent]);

  return (
    <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={dialogsRef} nodeId={id} selected={selected}>
      <InputFormContainer ref={formRef} onBlur={onBlur} key={id}>
        <Select
          name="waitAllevent"
          label={t('event_command_wait_move_completion_select')}
          options={waitEventOptions}
          value={waitEvent}
          className="nodrag"
          onChange={onWaitAllEventChange}
        />

        {waitEvent === 'some' && (
          <MultiSelect
            name="waitById"
            label={t('event_command_wait_move_completion_multiselect_label')}
            options={eventToWaitOptions}
            value={commandData.waitById}
            className="nodrag"
          />
        )}
      </InputFormContainer>
    </CommandNode>
  );
};
