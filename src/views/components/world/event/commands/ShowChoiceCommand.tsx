import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { CommandId, StudioEventCommandData, StudioEventCommandShowChoice } from '@modelEntities/event/command';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';
import { ShowChoiceEditorTitle, ShowChoiceOverlay } from './editors/ShowChoiceOverlay';

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

const ChoiceLabelContainer = styled.div<{ defaultChoice: boolean }>`
  height: 32px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme, defaultChoice }) => (defaultChoice ? theme.colors.text400 : theme.colors.text100)};
`;

export const ShowChoiceCommand = ({ id, data: { dialogsRef: commandDialogsRef, command, comments, csvFileId }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandShowChoice>(id);
  const { type: commandType } = command as StudioEventCommandData<StudioEventCommandShowChoice>;
  const showChoiceCommand = command as StudioEventCommandData<StudioEventCommandShowChoice>;
  // We use the texts from the GlobalState, so updating the text of a ShowChoice command refreshes all ShowChoice commands in the event.
  // This results in a loss of optimization, but the application's design does not allow for any other approach.
  const getText = useGetProjectText();
  const setText = useSetProjectText();
  const { t } = useTranslation();
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const narratorRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<ShowChoiceEditorTitle>();
  const narratorText = getText(csvFileId, showChoiceCommand.narrator);
  const messageText = getText(csvFileId, showChoiceCommand.message);
  const choiceTexts = showChoiceCommand.choices.map((id) => getText(csvFileId, id));

  useEffect(() => {
    if (narratorRef.current) narratorRef.current.value = narratorText;
    if (messageRef.current) messageRef.current.value = messageText;
  }, [narratorText, messageText]);

  const handleTranslateMessageClick = () => {
    if (!messageRef.current) return;

    setText(csvFileId, showChoiceCommand.message, messageRef.current.value);
    setTimeout(() => dialogsRef.current?.openDialog('translation_message'), 0);
  };

  const handleTranslateNarratorClick = () => {
    if (!narratorRef.current) return;

    setText(csvFileId, showChoiceCommand.narrator, narratorRef.current.value);
    setTimeout(() => dialogsRef.current?.openDialog('translation_narrator'), 0);
  };

  const onBlur = () => {
    if (!messageRef.current || !narratorRef.current) return;

    setText(csvFileId, showChoiceCommand.narrator, narratorRef.current.value);
    setText(csvFileId, showChoiceCommand.message, messageRef.current.value);
  };

  const onShowChoiceOverlayClose = () => {
    if (!messageRef.current || !narratorRef.current) return;

    messageRef.current.value = messageRef.current.defaultValue;
    narratorRef.current.value = narratorRef.current.defaultValue;
  };

  return (
    <>
      <CommandNode
        commandType={commandType}
        commentCount={comments.length}
        dialogsRef={commandDialogsRef}
        nodeId={id}
        selected={selected}
        outputCount={showChoiceCommand.choices.length}
      >
        <InputFormContainer onBlur={onBlur}>
          {showChoiceCommand.withMessage && (
            <>
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
            </>
          )}
          {showChoiceCommand.choices.map((_choice, idx) => (
            <ChoiceLabelContainer key={idx} defaultChoice={idx === showChoiceCommand.defaultChoice}>
              {choiceTexts[idx]}
            </ChoiceLabelContainer>
          ))}
        </InputFormContainer>
      </CommandNode>
      <ShowChoiceOverlay
        commandId={id as CommandId}
        command={showChoiceCommand}
        csvFileId={csvFileId}
        onClose={onShowChoiceOverlayClose}
        ref={dialogsRef}
      />
    </>
  );
};
