import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import z from 'zod';
import {
  EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR,
  StudioEventWaitMovementCompletion,
} from '../../../../../../../models/entities/event/waitCommand/waitMovementCompletion';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer } from '../../../../../inputs';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { useSharedOptions } from '../../sharedSelectOptions';
import { EventEditorProps } from '../EventEditorProps';

const TimeoutInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const WAIT_MOVEMENT_COMPLETION_EDITOR_SCHEMA = EVENT_COMMAND_WAIT_MOVEMENT_COMPLETION_VALIDATOR.pick({
  timeout: true,
}).extend({
  waitAllevent: z.enum(['all', 'some']),
  waitById: z.array(z.string()).optional(),
});

export const WaitMovementCompletionEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventWaitMovementCompletion>(event, defaultCommandId);
  const commandDataForForm = useMemo(
    () => ({
      ...command,
      waitAllevent: (command.waitAllevent ? 'all' : 'some') as 'all' | 'some',
    }),
    [command.waitAllevent, command.waitById, command.timeout],
  );
  const { globalStaticEvent } = useSharedOptions();
  const { canClose, getFormData, defaults, formRef } = useZodForm(WAIT_MOVEMENT_COMPLETION_EDITOR_SCHEMA, commandDataForForm);
  const { Input, Select, MultiSelect } = useInputAttrsWithLabel(WAIT_MOVEMENT_COMPLETION_EDITOR_SCHEMA, defaults);
  const timeoutRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const [waitEvent, setWaitEvent] = useState<string>(command.waitAllevent ? 'all' : 'some');

  const waitEventOptions = useMemo(
    () => [
      { label: t('event_command_wait_move_completion_select_all'), value: 'all' },
      { label: t('event_command_wait_move_completion_select_some'), value: 'some' },
    ],
    [t],
  );

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

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand({
      ...result.data,
      waitAllevent: waitEvent === 'all',
      timeout: timeoutRef.current ? Number(timeoutRef.current.value) : result.data.timeout,
    });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('event_command_wait_move_completion')}>
      <InputFormContainer ref={formRef}>
        <Select
          name="waitAllevent"
          label={t('event_command_wait_move_completion_select')}
          options={waitEventOptions}
          value={waitEvent}
          onChange={(value: string) => setWaitEvent(value)}
        />

        {waitEvent === 'some' && (
          <MultiSelect
            name="waitById"
            label={t('event_command_wait_move_completion_multiselect_label')}
            options={eventToWaitOptions}
            value={command.waitById}
          />
        )}

        <InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Input name="timeout" label={t('event_editor_wait_move_completion_timeout')} labelLeft defaultValue={command.timeout} ref={timeoutRef} />
          </InputWithLeftLabelContainer>
          <TimeoutInfo>{t('event_editor_wait_move_completion_timeout_info')}</TimeoutInfo>
        </InputWithTopLabelContainer>
      </InputFormContainer>
    </Editor>
  );
});

WaitMovementCompletionEditor.displayName = 'WaitMovementCompletionEditor';
