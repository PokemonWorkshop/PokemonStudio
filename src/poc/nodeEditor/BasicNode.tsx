import styled from 'styled-components';
import React from 'react';
import type { EventDialogsRef } from './EventEditorOverlay';
import { useTranslation } from 'react-i18next';
import type { StudioEventCommand } from '@modelEntities/event/command';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { useEventContext } from '@components/event/EventContext';

type BasicNodeProps = {
  id: string;
  data: {
    dialogsRef?: EventDialogsRef;
    commandType: StudioEventCommand;
    textVersion: number;
  };
  selected?: boolean;
};

const BasicNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 240px;
  background-color: white;
  border-radius: 8px;

  &[data-selected='true'] {
    border: 2px solid red;
  }
`;

export const BasicNode = ({ id, data: { dialogsRef, commandType, textVersion }, selected }: BasicNodeProps) => {
  const { setCurrentEditedNode } = useEventContext();
  const { t } = useTranslation();
  const isControlPressed = useKeyPress(CONTROL);

  return (
    <BasicNodeContainer
      onClick={() => {
        if (isControlPressed) return;

        setCurrentEditedNode(id);
        dialogsRef?.current?.openDialog(commandType);
      }}
      data-selected={selected}
    >
      {t(`event_command_${commandType}`)}
      <span>{textVersion}</span>
    </BasicNodeContainer>
  );
};
