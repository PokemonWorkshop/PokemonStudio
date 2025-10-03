import React, { DragEvent } from 'react';
import styled from 'styled-components';
import { useEventDnD } from './EventDnDContext';
import { useTranslation } from 'react-i18next';

const EventCommandContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  height: 100px;
  justify-content: space-between;
  cursor: grab;

  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 100%), rgb(37, 38, 42);
  background-blend-mode: overlay, normal;
  border: 0.5px solid rgb(46, 48, 54);
  box-shadow: 0px 1px 1px -0.5px rgba(0, 0, 0, 0.05), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .command-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .helper-icon {
    }
  }

  .title {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
  }
`;

type EventCommandProps = {
  command: string;
  hasHelper?: boolean;
};

export const EventCommand = ({ command, hasHelper }: EventCommandProps) => {
  const { setType } = useEventDnD();
  const { t } = useTranslation();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType?: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <EventCommandContainer draggable onDragStart={(event) => onDragStart(event, command)}>
      <div className="header">
        <span className="command-icon">CI</span>
        {hasHelper && (
          <span data-tooltip={t(`event_command_${command}_helper`)} className="helper-icon">
            HI
          </span>
        )}
      </div>
      <span className="title">{t(`event_command_${command}`)}</span>
    </EventCommandContainer>
  );
};
