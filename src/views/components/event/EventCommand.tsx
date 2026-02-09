import React, { DragEvent } from 'react';
import styled from 'styled-components';
import { useEventContext } from './EventContext';
import { useTranslation } from 'react-i18next';
import HelperIcon from '@assets/icons/global/error2.svg';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import { IconsFromCommand } from './EventCommandIcon';

const CommandIconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;

  &[data-color='violet'] {
    color: rgb(149, 89, 208);
  }

  &[data-color='blue'] {
    color: rgb(37, 113, 201);
  }
`;

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

    .helper-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${({ theme }) => theme.colors.text400};

      svg {
        pointer-events: none;
      }
    }
  }

  .title {
    display: -webkit-box;
    ${({ theme }) => theme.fonts.normalSmall}
    color: ${({ theme }) => theme.colors.text100};
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
`;

type EventCommandProps = {
  command: StudioEventCommandType;
  hasHelper?: boolean;
  color: string;
};

export const EventCommand = ({ command, hasHelper, color }: EventCommandProps) => {
  const { setType } = useEventContext();
  const { t } = useTranslation();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType?: StudioEventCommandType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <EventCommandContainer draggable onDragStart={(event) => onDragStart(event, command)}>
      <div className="header">
        <CommandIconContainer data-color={color}>{IconsFromCommand[command]}</CommandIconContainer>
        {hasHelper && (
          <span className="helper-icon" data-tooltip={t(`event_command_${command}_helper`)}>
            <HelperIcon />
          </span>
        )}
      </div>
      <span className="title">{t(`event_command_${command}`)}</span>
    </EventCommandContainer>
  );
};
