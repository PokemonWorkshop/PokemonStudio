import React, { DragEvent } from 'react';
import styled from 'styled-components';
import { useEventDnD } from './EventDnDContext';
import { useTranslation } from 'react-i18next';
import HelperIcon from '@assets/icons/global/error2.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import type { StudioEventCommand } from '@root/src/models/entities/event/command';

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
      height: 24px;
      width: 24px;
      color: rgb(149, 89, 208);
    }

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
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
  }
`;

// TODO: update icons
const IconsFromCommand: Record<StudioEventCommand, JSX.Element> = {
  call_event: <PlusIcon />,
  add_condition: <PlusIcon />,
  insert_loop: <PlusIcon />,
  stop_event_execution: <PlusIcon />,
  add_jump_another_command: <PlusIcon />,
  show_message: <PlusIcon />,
};

type EventCommandProps = {
  command: StudioEventCommand;
  hasHelper?: boolean;
};

export const EventCommand = ({ command, hasHelper }: EventCommandProps) => {
  const { setType } = useEventDnD();
  const { t } = useTranslation();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType?: StudioEventCommand) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <EventCommandContainer draggable onDragStart={(event) => onDragStart(event, command)}>
      <div className="header">
        <span className="command-icon">{IconsFromCommand[command]}</span>
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
