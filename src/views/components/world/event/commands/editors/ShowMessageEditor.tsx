import { DarkButtonEditResponsive, DarkButtonQuestionMarkResponsive } from '@components/buttons/DarkButtonWithPlusIcon';
import { EditorWithCollapse } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputFormContainer, PaddedInputContainer } from '@components/inputs/InputContainer';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';

const SHOW_MESSAGE_EDITOR_SCHEMA = EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR.pick({
  message: true,
  allowSkipping: true,
  narrator: true,
  nameColor: true,
  showMessageBox: true,
  messageBoxPosition: true,
  messageBoxAppearance: true,
  lookAtThisEvent: true,
  lookToOtherEvent: true,
  minimap: true,
  portraits: true,
});

const InfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const ShowMessageEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandShowMessage>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(SHOW_MESSAGE_EDITOR_SCHEMA, command);
  const { DropInput, Input, MultiLineInput, Toggle, Select } = useInputAttrsWithLabel(SHOW_MESSAGE_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [color, setColor] = useState<string>(command.nameColor);
  const messageBoxOptions = useMemo(
    () => [
      { value: 'bottom', label: t('bottom') },
      { value: 'middle', label: t('middle') },
      { value: 'top', label: t('top') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const lookToEventOptions = useMemo(
    () => [{ value: '__undef__', label: t('none') }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t(`event_command_show_message`)}>
      <InputFormContainer ref={formRef} size="m">
        <PaddedInputContainer>
          <InputContainer size="xxs">
            <MultiLineInput name="message" label={t('event_command_message')} placeholder={t('event_command_message_placeholder')} />
            <DarkButtonQuestionMarkResponsive>{t('event_command_format_options')}</DarkButtonQuestionMarkResponsive>
          </InputContainer>
          <Toggle name="allowSkipping" label={t('event_command_allow_skipping')} />
        </PaddedInputContainer>
        <DarkButtonEditResponsive>{t('event_command_edit_portraits')}</DarkButtonEditResponsive>
        <InputGroupCollapse title={t('event_command_narrator')} collapseByDefault gap="24px" noMargin>
          <Input name="narrator" label={t('event_command_narrator_name')} placeholder={t('event_command_narrator_placeholder')} />
          <Input
            type="color"
            name="nameColor"
            label={t('event_command_name_color')}
            labelLeft={true}
            defaultValue={color}
            onBlur={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => setColor(e.target.value)}
            placeholder={t('event_command_name_color_placeholder')}
          />
        </InputGroupCollapse>
        <InputGroupCollapse title={t('event_command_message_box')} collapseByDefault gap="24px" noMargin>
          <Toggle name="showMessageBox" label={t('event_command_show_message_box')} />
          <Select name="messageBoxPosition" label={t('event_command_message_box_position')} options={messageBoxOptions} />
          <DropInput
            name="messageBoxAppearance"
            label={t('event_command_message_box_appearance')}
            extensions={['png']}
            filename={t('event_command_message_box_appearance')}
          />
        </InputGroupCollapse>
        <InputGroupCollapse title={t('event_command_other_options')} collapseByDefault gap="24px" noMargin>
          <InputContainer size="xxs">
            <Toggle name="lookAtThisEvent" label={t('event_command_look_at_this_event')} />
            <InfoContainer>{t('event_command_look_at_this_event_info')}</InfoContainer>
          </InputContainer>
          <Select name="lookToOtherEvent" label={t('event_command_look_to_other_event')} options={lookToEventOptions} />
          <DropInput name="minimap" label={t('event_command_minimap')} extensions={['png']} filename={t('event_command_minimap')} />
        </InputGroupCollapse>
      </InputFormContainer>
    </EditorWithCollapse>
  );
});

ShowMessageEditor.displayName = 'ShowMessageEditor';
