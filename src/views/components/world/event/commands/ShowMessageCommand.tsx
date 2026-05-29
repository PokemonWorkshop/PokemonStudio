import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { CommandId, StudioEventCommandData, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useEventData } from '../common/EventContext';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';
import { ShowMessageEditorTitle, ShowMessageOverlay } from './editors/ShowMessageOverlay';

const sharedInputStyles = css`
  background-color: rgba(255, 255, 255, 0.0001);
  box-shadow:
    0px 3px 1px -2px rgba(38, 47, 56, 0.06),
    0px 2px 3px rgba(38, 47, 56, 0.05),
    0px 0px 0px 1px rgba(202, 211, 241, 0.13);
  border-radius: 8px;
`;

const TranslateInput = styled(Input)`
  ${sharedInputStyles}
  height: 40px;
`;

const TranslateMultiLineInput = styled(MultiLineInput)`
  ${sharedInputStyles}
  resize: vertical;
  min-height: 76px;
`;

export const ShowMessageCommand = ({ id, data: { dialogsRef: commandDialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandShowMessage>(id);
  const { type: commandType } = command as StudioEventCommandData<StudioEventCommandShowMessage>;
  const showMessageCommand = command as StudioEventCommandData<StudioEventCommandShowMessage>;
  const { event } = useEventData();
  const getText = useGetProjectText();
  const setText = useSetProjectText();
  const { t } = useTranslation();
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const narratorRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<ShowMessageEditorTitle>();
  const narratorText = event ? getText(event.csvFileId, showMessageCommand.narrator) : '';
  const messageText = event ? getText(event.csvFileId, showMessageCommand.message) : '';

  useEffect(() => {
    if (narratorRef.current) narratorRef.current.value = narratorText;
    if (messageRef.current) messageRef.current.value = messageText;
  }, [narratorText, messageText]);

  const handleTranslateMessageClick = () => {
    if (!messageRef.current || !event) return;

    setText(event.csvFileId, showMessageCommand.message, messageRef.current.value);
    setTimeout(() => dialogsRef.current?.openDialog('translation_message'), 0);
  };

  const handleTranslateNarratorClick = () => {
    if (!narratorRef.current || !event) return;

    setText(event.csvFileId, showMessageCommand.narrator, narratorRef.current.value);
    setTimeout(() => dialogsRef.current?.openDialog('translation_narrator'), 0);
  };

  const onBlur = () => {
    if (!event || !messageRef.current || !narratorRef.current) return;

    setText(event.csvFileId, showMessageCommand.narrator, narratorRef.current.value);
    setText(event.csvFileId, showMessageCommand.message, messageRef.current.value);
  };

  const onShowMessageOverlayClose = () => {
    if (!messageRef.current || !narratorRef.current) return;

    messageRef.current.value = messageRef.current.defaultValue;
    narratorRef.current.value = narratorRef.current.defaultValue;
  };

  return (
    <>
      <CommandNode commandType={commandType} commentCount={comments.length} dialogsRef={commandDialogsRef} nodeId={id} selected={selected}>
        <InputFormContainer onBlur={onBlur}>
          <InputWithTopLabelContainer>
            <Label htmlFor="narrator">{t('event_command_narrator')}</Label>
            <TranslateInputContainer onTranslateClick={handleTranslateNarratorClick}>
              <TranslateInput
                name="narrator"
                defaultValue={narratorText}
                placeholder={t('event_command_narrator_placeholder')}
                ref={narratorRef}
                className="nodrag"
                onDoubleClick={(e) => e.stopPropagation()}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="message">{t('event_command_message')}</Label>
            <TranslateInputContainer onTranslateClick={handleTranslateMessageClick}>
              <TranslateMultiLineInput
                name="message"
                defaultValue={messageText}
                placeholder={t('event_command_message_placeholder')}
                ref={messageRef}
                className="nodrag"
                onDoubleClick={(e) => e.stopPropagation()}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
        </InputFormContainer>
      </CommandNode>
      {event && (
        <ShowMessageOverlay
          commandId={id as CommandId}
          command={showMessageCommand}
          event={event}
          onClose={onShowMessageOverlayClose}
          ref={dialogsRef}
        />
      )}
    </>
  );
};
