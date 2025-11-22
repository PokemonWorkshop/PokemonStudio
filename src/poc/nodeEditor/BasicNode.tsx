import styled from 'styled-components';
import React from 'react';
import type { EventDialogsRef } from './EventEditorOverlay';
import { useTranslation } from 'react-i18next';
import type { StudioEventCommand } from '@modelEntities/event/command';

type BasicNodeProps = {
  data: {
    dialogsRef?: EventDialogsRef;
    commandType: StudioEventCommand;
  };
  selected?: boolean;
};

const BasicNodeContainer = styled.div`
  display: block;
  width: 320px;
  height: 240px;
  background-color: white;
  border-radius: 8px;

  &[data-selected='true'] {
    border: 2px solid red;
  }
`;

export const BasicNode = ({ data: { dialogsRef, commandType }, selected }: BasicNodeProps) => {
  const { t } = useTranslation();

  return (
    <BasicNodeContainer onClick={() => dialogsRef?.current?.openDialog(commandType)} data-selected={selected}>
      {t(`event_command_${commandType}`)}
    </BasicNodeContainer>
  );
};
