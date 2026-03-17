import styled from 'styled-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudioEventCommandInsertScript } from '@modelEntities/event/command';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { useEventContext } from '@components/event/EventContext';
import { Handle, Position } from '@xyflow/react';
import { MultiLineInput } from '@components/inputs';
import { EventNodeProps } from './EventNodeProps';

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

export const InsertScriptNode = ({ id, data: { dialogsRef, command }, selected }: EventNodeProps) => {
  const { setCurrentEditedNode } = useEventContext();
  const { t } = useTranslation();
  const isControlPressed = useKeyPress(CONTROL);
  const { type: commandType, comment, script } = command as StudioEventCommandInsertScript;

  return (
    <>
      <Handle type="target" position={Position.Left} id="Tleft" />
      <Handle type="source" position={Position.Right} id="Sright" />
      <BasicNodeContainer
        onClick={() => {
          if (isControlPressed) return;

          setCurrentEditedNode(id);
          dialogsRef?.current?.openDialog(commandType);
        }}
        data-selected={selected}
      >
        {t(`event_command_${commandType}`)}
        <span>
          {t(`event_command_comment`)}:{comment}
        </span>
        <span>{t(`event_command_script`)}</span>
        <MultiLineInput value={script} readOnly />
      </BasicNodeContainer>
    </>
  );
};
