import { StudioEventCommandData, StudioEventCommandShowChoice } from '@modelEntities/event/command';
import { useGetProjectText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCommandNode } from '../hooks/useCommandNode';
import { CommandNodeProps } from './CommandNodeProps';

const ChoiceLabelContainer = styled.div<{ isCancel: boolean }>`
  height: 32px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme, isCancel }) => (isCancel ? theme.colors.text400 : theme.colors.text100)};
`;

export const ShowChoiceCommand = ({ id, data: { dialogsRef: commandDialogsRef, command, comments, csvFileId }, selected }: CommandNodeProps) => {
  const { CommandNode } = useCommandNode<StudioEventCommandShowChoice>(id);
  const { type: commandType } = command as StudioEventCommandData<StudioEventCommandShowChoice>;
  const showChoiceCommand = command as StudioEventCommandData<StudioEventCommandShowChoice>;
  // We use the texts from the GlobalState, so updating the text of a ShowChoice command refreshes all ShowChoice commands in the event.
  // This results in a loss of optimization, but the application's design does not allow for any other approach.
  const getText = useGetProjectText();
  const { t } = useTranslation();
  const choiceTexts = showChoiceCommand.choices.map((id) => getText(csvFileId, id));

  return (
    <>
      <CommandNode
        commandType={commandType}
        commentCount={comments.length}
        dialogsRef={commandDialogsRef}
        nodeId={id}
        selected={selected}
        outputCount={showChoiceCommand.choices.length + 1}
      >
        {showChoiceCommand.choices.map((_choice, idx) => (
          <ChoiceLabelContainer key={idx} isCancel={false}>
            {choiceTexts[idx]}
          </ChoiceLabelContainer>
        ))}
        <ChoiceLabelContainer key="cancel" isCancel={true}>
          {t(`event_command_cancellation`)}
        </ChoiceLabelContainer>
      </CommandNode>
    </>
  );
};
